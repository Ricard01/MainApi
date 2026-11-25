using System.Data.Common;
using FluentValidation.Results;
using MainApi.Application.Common.Exceptions;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Facturas.ComercialSdk;
using Microsoft.Extensions.Logging;
using ValidationException = MainApi.Application.Common.Exceptions.ValidationException;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.FacturarCotizacion;

/// <summary>
/// Convierte la cotización en una factura sin timbrar tal cual está, igual que Comercial: la factura copia
/// referencia, observaciones, textos extra, destinatario y agente de la cotización, y todas sus partidas con
/// producto, almacén, unidades, precio, descuento y observaciones. Lo único que puede cambiarse es el cliente.
/// </summary>
public sealed record FacturarCotizacionCommand : IRequest<CotizacionFacturada>
{
    public int IdCotizacion { get; init; }

    /// <summary>Cliente de la factura; si es nulo se usa el de la cotización.</summary>
    public int? IdCliente { get; init; }
}

/// <param name="IdFactura">Identificador de la factura en CONTPAQi.</param>
/// <param name="Serie">Serie asignada por el concepto.</param>
/// <param name="Folio">Folio asignado.</param>
public sealed record CotizacionFacturada(int IdFactura, string Serie, decimal Folio);

public sealed class FacturarCotizacionCommandHandler(
    IContpaqiSqlConnection sqlConnection,
    ICotizacionFacturacionService facturacionService,
    IComercialSdkClient comercialSdk,
    ILogger<FacturarCotizacionCommandHandler> logger)
    : IRequestHandler<FacturarCotizacionCommand, CotizacionFacturada>
{
    /// <summary>Concepto "Factura CFDi 4.0" en CONTPAQi (<c>CIDCONCEPTODOCUMENTO</c>).</summary>
    public const int IdConceptoFactura = 5;

    private const int MaximoIntentos = 3;

    // CONTPAQi guarda unidades e importes como float: se comparan con esta tolerancia.
    private const decimal Tolerancia = 0.000001m;

    public async Task<CotizacionFacturada> Handle(FacturarCotizacionCommand request,
        CancellationToken cancellationToken)
    {
        var (factura, partidas) = await PrepararFacturaAsync(request, cancellationToken);

        var creada = await comercialSdk.CrearFacturaAsync(factura, cancellationToken);
        if (creada.IdMovimientos.Count != partidas.Count)
        {
            await DeshacerFacturaAsync(creada, request.IdCotizacion);
            throw new ComercialSdkException(
                $"El servicio SDK devolvió {creada.IdMovimientos.Count} partidas y se enviaron {partidas.Count}.");
        }

        var liga = new LigaFacturaCotizacion(
            request.IdCotizacion,
            creada.IdDocumento,
            partidas
                .Select((partida, i) =>
                    new LigaPartida(partida.IdMovimiento, creada.IdMovimientos[i], partida.UnidadesPendientes))
                .ToList());

        try
        {
            await LigarConReintentosAsync(liga, cancellationToken);
        }
        catch
        {
            // La factura ya existe en Comercial pero sin su liga: se borra para no dejarla suelta.
            // Se usa CancellationToken.None para que una cancelación del cliente no impida deshacerla.
            await DeshacerFacturaAsync(creada, request.IdCotizacion);
            throw;
        }

        logger.LogInformation(
            "Cotización {IdCotizacion} convertida en la factura {Serie}-{Folio} (id {IdFactura})",
            request.IdCotizacion, creada.Serie, creada.Folio, creada.IdDocumento);

        return new CotizacionFacturada(creada.IdDocumento, creada.Serie, (decimal)creada.Folio);
    }

    private async Task<(NuevaFacturaSdk Factura, IReadOnlyList<MovimientoParaFacturar> Partidas)> PrepararFacturaAsync(
        FacturarCotizacionCommand request,
        CancellationToken cancellationToken)
    {
        await using var connection = await sqlConnection.CreateAsync();

        var cotizacion =
            await facturacionService.ObtenerCotizacionAsync(connection, request.IdCotizacion, cancellationToken)
            ?? throw new KeyNotFoundException($"No existe la cotización {request.IdCotizacion}.");

        // Se facturan todas las partidas con lo que les queda pendiente, en el orden de la cotización.
        var partidas = cotizacion.Movimientos.Where(m => m.UnidadesPendientes > Tolerancia).ToList();
        if (cotizacion.UnidadesPendientes <= Tolerancia || partidas.Count == 0)
        {
            throw new ConflictException("La cotización ya fue facturada por completo.");
        }

        var codigoCliente = cotizacion.CodigoCliente;
        if (request.IdCliente is { } idCliente)
        {
            codigoCliente = await facturacionService.ObtenerCodigoClienteAsync(connection, idCliente, cancellationToken)
                            ?? throw new ValidationException([
                                new ValidationFailure(nameof(request.IdCliente),
                                    "El cliente no existe o no está activo.")
                            ]);
        }

        var codigoConcepto =
            await facturacionService.ObtenerCodigoConceptoAsync(connection, IdConceptoFactura, cancellationToken)
            ?? throw new InvalidOperationException(
                $"No existe el concepto de factura {IdConceptoFactura} en CONTPAQi.");

        var factura = new NuevaFacturaSdk
        {
            CodigoConcepto = codigoConcepto,
            Fecha = DateOnly.FromDateTime(DateTime.Today),
            CodigoCliente = codigoCliente,
            CodigoAgente = cotizacion.CodigoAgente,
            Referencia = Texto(cotizacion.Referencia),
            Observaciones = Texto(cotizacion.Observaciones),
            TextoExtra1 = Texto(cotizacion.TextoExtra1),
            TextoExtra2 = Texto(cotizacion.TextoExtra2),
            TextoExtra3 = Texto(cotizacion.TextoExtra3),
            Destinatario = Texto(cotizacion.Destinatario),
            Movimientos = [.. partidas.Select(ToMovimientoSdk)]
        };

        return (factura, partidas);
    }

    private static NuevoMovimientoSdk ToMovimientoSdk(MovimientoParaFacturar movimiento)
    {
        var unidades = movimiento.UnidadesPendientes;

        // El porcentaje se respeta tal cual; un descuento por importe se prorratea a las unidades facturadas
        // (si la cotización no tiene facturas previas, son todas y el descuento queda igual).
        double? porcentaje = movimiento.PorcentajeDescuento > 0 ? (double)movimiento.PorcentajeDescuento : null;
        double? importe = porcentaje is null && movimiento.Descuento > 0 && movimiento.Unidades > 0
            ? (double)Math.Round(movimiento.Descuento * unidades / movimiento.Unidades, 2,
                MidpointRounding.AwayFromZero)
            : null;

        return new NuevoMovimientoSdk
        {
            CodigoProducto = movimiento.CodigoProducto,
            CodigoAlmacen = movimiento.CodigoAlmacen,
            Unidades = (double)unidades,
            Precio = (double)movimiento.Precio,
            PorcentajeDescuento = porcentaje,
            ImporteDescuento = importe,
            Observaciones = Texto(movimiento.Observaciones),
        };
    }

    private async Task LigarConReintentosAsync(LigaFacturaCotizacion liga, CancellationToken cancellationToken)
    {
        for (var intento = 1;; intento++)
        {
            await using var connection = await sqlConnection.CreateAsync();
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
            try
            {
                await facturacionService.LigarFacturaAsync(connection, transaction, liga, cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return;
            }
            catch (DbException exception)
                when (sqlConnection.EsErrorReintentable(exception) && intento < MaximoIntentos)
            {
                await RollbackSeguroAsync(transaction);
                await Task.Delay(TimeSpan.FromMilliseconds(50 * intento), cancellationToken);
            }
            catch
            {
                await RollbackSeguroAsync(transaction);
                throw;
            }
        }
    }

    private async Task DeshacerFacturaAsync(FacturaSdkCreada factura, int idCotizacion)
    {
        try
        {
            await comercialSdk.BorrarFacturaAsync(factura.IdDocumento, CancellationToken.None);
        }
        catch (Exception exception)
        {
            // El error original es el que se devuelve; éste requiere atención manual en Comercial.
            logger.LogError(exception,
                "No se pudo borrar la factura {Serie}-{Folio} (id {IdFactura}) creada para la cotización {IdCotizacion}; " +
                "quedó sin ligar y debe borrarse manualmente en Comercial",
                factura.Serie, factura.Folio, factura.IdDocumento, idCotizacion);
        }
    }

    private static async Task RollbackSeguroAsync(DbTransaction transaction)
    {
        try
        {
            await transaction.RollbackAsync(CancellationToken.None);
        }
        catch (InvalidOperationException)
        {
            // En un deadlock SQL Server puede haber revertido la transacción antes que nosotros.
        }
    }

    private static string? Texto(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor;
}