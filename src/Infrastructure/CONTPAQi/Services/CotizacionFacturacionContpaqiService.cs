using System.Data;
using System.Globalization;
using Dapper;
using MainApi.Application.Common.Exceptions;
using MainApi.Application.CONTPAQi.Cotizaciones.Commands.FacturarCotizacion;

namespace MainApi.Infrastructure.CONTPAQi.Services;

/// <summary>
/// Consultas y escrituras SQL de la conversión cotización → factura. Lo que se escribe aquí se comparó
/// campo por campo contra una conversión hecha desde Comercial: el SDK no permite escribir la liga con el
/// documento de origen (<c>CIDDOCUMENTOORIGEN</c> es "dato de control" y <c>CIDMOVTOORIGEN</c> lo ignora).
/// </summary>
public sealed class CotizacionFacturacionContpaqiService : ICotizacionFacturacionService
{
    private const int TipoCotizacion = 1;
    private const int ConceptoCotizacion = 1;
    private const int TipoFactura = 4;

    // CONTPAQi guarda las unidades como float: el pendiente se redondea para que una partida
    // facturada por completo quede exactamente en 0 y la cotización se vea como "facturada".
    private const int DecimalesUnidades = 6;
    private const decimal Tolerancia = 0.000001m;

    public async Task<CotizacionParaFacturar?> ObtenerCotizacionAsync(
        IDbConnection connection,
        int idCotizacion,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT d.CIDDOCUMENTO AS IdDocumento,
                                  d.CSERIEDOCUMENTO AS Serie,
                                  d.CFOLIO AS Folio,
                                  c.CCODIGOCLIENTE AS CodigoCliente,
                                  NULLIF(a.CCODIGOAGENTE, '') AS CodigoAgente,
                                  d.CREFERENCIA AS Referencia,
                                  d.COBSERVACIONES AS Observaciones,
                                  d.CTEXTOEXTRA1 AS TextoExtra1,
                                  d.CTEXTOEXTRA2 AS TextoExtra2,
                                  d.CTEXTOEXTRA3 AS TextoExtra3,
                                  d.CDESTINATARIO AS Destinatario,
                                  ISNULL(d.CFECHAEXTRA, '18991230') AS FechaExtra,
                                  d.CIMPORTEEXTRA1 AS ImporteExtra1,
                                  d.CIMPORTEEXTRA2 AS ImporteExtra2,
                                  d.CIMPORTEEXTRA3 AS ImporteExtra3,
                                  d.CIMPORTEEXTRA4 AS ImporteExtra4,
                                  d.CUNIDADESPENDIENTES AS UnidadesPendientes
                           FROM admDocumentos d
                           JOIN admClientes c ON c.CIDCLIENTEPROVEEDOR = d.CIDCLIENTEPROVEEDOR
                           LEFT JOIN admAgentes a ON a.CIDAGENTE = d.CIDAGENTE
                           WHERE d.CIDDOCUMENTO = @IdCotizacion
                             AND d.CIDDOCUMENTODE = @TipoCotizacion
                             AND d.CIDCONCEPTODOCUMENTO = @ConceptoCotizacion;

                           SELECT m.CIDMOVIMIENTO AS IdMovimiento,
                                  p.CCODIGOPRODUCTO AS CodigoProducto,
                                  al.CCODIGOALMACEN AS CodigoAlmacen,
                                  m.CUNIDADES AS Unidades,
                                  m.CUNIDADESPENDIENTES AS UnidadesPendientes,
                                  m.CPRECIO AS Precio,
                                  m.CPORCENTAJEDESCUENTO1 AS PorcentajeDescuento,
                                  m.CDESCUENTO1 AS Descuento,
                                  m.COBSERVAMOV AS Observaciones,
                                  m.CTEXTOEXTRA1 AS TextoExtra1,
                                  m.CTEXTOEXTRA2 AS TextoExtra2,
                                  m.CTEXTOEXTRA3 AS TextoExtra3,
                                  ISNULL(m.CFECHAEXTRA, '18991230') AS FechaExtra,
                                  m.CIMPORTEEXTRA1 AS ImporteExtra1,
                                  m.CIMPORTEEXTRA2 AS ImporteExtra2,
                                  m.CIMPORTEEXTRA3 AS ImporteExtra3,
                                  m.CIMPORTEEXTRA4 AS ImporteExtra4
                           FROM admMovimientos m
                           JOIN admProductos p ON p.CIDPRODUCTO = m.CIDPRODUCTO
                           JOIN admAlmacenes al ON al.CIDALMACEN = m.CIDALMACEN
                           WHERE m.CIDDOCUMENTO = @IdCotizacion
                           ORDER BY m.CNUMEROMOVIMIENTO, m.CIDMOVIMIENTO;
                           """;

        using var result = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            new { IdCotizacion = idCotizacion, TipoCotizacion, ConceptoCotizacion },
            cancellationToken: cancellationToken));

        var cotizacion = await result.ReadSingleOrDefaultAsync<CotizacionParaFacturar>();
        if (cotizacion is null)
        {
            return null;
        }

        cotizacion.Movimientos = (await result.ReadAsync<MovimientoParaFacturar>()).AsList();
        return cotizacion;
    }

    public Task<string?> ObtenerCodigoClienteAsync(
        IDbConnection connection,
        int idCliente,
        CancellationToken cancellationToken)
    {
        // Mismo filtro que el catálogo de clientes: tipo cliente (1) o cliente-proveedor (2) y activo.
        const string sql = """
                           SELECT CCODIGOCLIENTE
                           FROM admClientes
                           WHERE CIDCLIENTEPROVEEDOR = @IdCliente
                             AND CTIPOCLIENTE IN (1, 2)
                             AND CESTATUS = 1;
                           """;

        return connection.QuerySingleOrDefaultAsync<string?>(new CommandDefinition(
            sql,
            new { IdCliente = idCliente },
            cancellationToken: cancellationToken));
    }

    public Task<string?> ObtenerCodigoConceptoAsync(
        IDbConnection connection,
        int idConcepto,
        CancellationToken cancellationToken)
    {
        return connection.QuerySingleOrDefaultAsync<string?>(new CommandDefinition(
            "SELECT CCODIGOCONCEPTO FROM admConceptos WHERE CIDCONCEPTODOCUMENTO = @IdConcepto;",
            new { IdConcepto = idConcepto },
            cancellationToken: cancellationToken));
    }

    public async Task LigarFacturaAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        LigaFacturaCotizacion liga,
        CancellationToken cancellationToken)
    {
        await EjecutarUnaFilaAsync(
            """
            UPDATE admDocumentos
            SET CIDDOCUMENTOORIGEN = @IdCotizacion
            WHERE CIDDOCUMENTO = @IdFactura
              AND CIDDOCUMENTODE = @TipoFactura
              AND CIDDOCUMENTOORIGEN = 0;
            """,
            new { liga.IdCotizacion, liga.IdFactura, TipoFactura },
            $"No se encontró la factura {liga.IdFactura} para ligarla a la cotización {liga.IdCotizacion}.");

        foreach (var partida in liga.Partidas)
        {
            // La guarda de pendientes hace que dos conversiones simultáneas no puedan facturar de más:
            // la segunda no encuentra la fila y su factura se deshace.
            var descontadas = await connection.ExecuteAsync(new CommandDefinition(
                """
                UPDATE admMovimientos
                SET CUNIDADESPENDIENTES = ROUND(CUNIDADESPENDIENTES - @Unidades, @Decimales)
                WHERE CIDMOVIMIENTO = @IdMovimientoCotizacion
                  AND CIDDOCUMENTO = @IdCotizacion
                  AND CUNIDADESPENDIENTES >= @Unidades - @Tolerancia;
                """,
                new
                {
                    Unidades = (double)partida.Unidades,
                    Decimales = DecimalesUnidades,
                    Tolerancia = (double)Tolerancia,
                    partida.IdMovimientoCotizacion,
                    liga.IdCotizacion,
                },
                transaction,
                cancellationToken: cancellationToken));

            if (descontadas != 1)
            {
                throw new ConflictException(
                    "La cotización cambió mientras se facturaba (otra conversión o una edición). Vuelve a cargarla e inténtalo de nuevo.");
            }

            await EjecutarUnaFilaAsync(
                """
                UPDATE admMovimientos
                SET CIDMOVTOORIGEN = @IdMovimientoCotizacion,
                    CUNIDADESORIGEN = @Unidades
                WHERE CIDMOVIMIENTO = @IdMovimientoFactura
                  AND CIDDOCUMENTO = @IdFactura;
                """,
                new
                {
                    partida.IdMovimientoCotizacion,
                    Unidades = (double)partida.Unidades,
                    partida.IdMovimientoFactura,
                    liga.IdFactura,
                },
                $"No se encontró la partida {partida.IdMovimientoFactura} de la factura {liga.IdFactura}.");
        }

        await EjecutarUnaFilaAsync(
            """
            UPDATE admDocumentos
            SET CUNIDADESPENDIENTES = (
                    SELECT ROUND(ISNULL(SUM(CUNIDADESPENDIENTES), 0), @Decimales)
                    FROM admMovimientos
                    WHERE CIDDOCUMENTO = @IdCotizacion),
                CTIMESTAMP = @Timestamp
            WHERE CIDDOCUMENTO = @IdCotizacion;
            """,
            new
            {
                liga.IdCotizacion,
                Decimales = DecimalesUnidades,
                // Mismo formato que escribe Comercial en CTIMESTAMP (mm/dd/aaaa hh:mm:ss:fff).
                Timestamp = DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss:fff", CultureInfo.InvariantCulture),
            },
            $"No se encontró la cotización {liga.IdCotizacion}.");

        return;

        async Task EjecutarUnaFilaAsync(string sql, object parametros, string mensajeError)
        {
            var filas = await connection.ExecuteAsync(new CommandDefinition(
                sql, parametros, transaction, cancellationToken: cancellationToken));

            if (filas != 1)
            {
                throw new DBConcurrencyException(mensajeError);
            }
        }
    }
}
