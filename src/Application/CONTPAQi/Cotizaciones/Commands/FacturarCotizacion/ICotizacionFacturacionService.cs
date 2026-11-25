using System.Data;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.FacturarCotizacion;

/// <summary>
/// Acceso por SQL a CONTPAQi para convertir una cotización en factura. La factura la crea el servicio SDK;
/// aquí solo se lee la cotización y, después, se escribe lo que el SDK no permite: la liga con el
/// documento de origen y el descuento de las unidades pendientes de la cotización.
/// </summary>
public interface ICotizacionFacturacionService
{
    /// <summary>Lee la cotización con todo lo que se copia a la factura. Nulo si no existe.</summary>
    Task<CotizacionParaFacturar?> ObtenerCotizacionAsync(
        IDbConnection connection,
        int idCotizacion,
        CancellationToken cancellationToken);

    /// <summary>Código de un cliente activo que puede facturarse. Nulo si no existe o no es cliente.</summary>
    Task<string?> ObtenerCodigoClienteAsync(
        IDbConnection connection,
        int idCliente,
        CancellationToken cancellationToken);

    /// <summary>Código del concepto de documento con el identificador indicado. Nulo si no existe.</summary>
    Task<string?> ObtenerCodigoConceptoAsync(
        IDbConnection connection,
        int idConcepto,
        CancellationToken cancellationToken);

    /// <summary>
    /// Escribe, dentro de la transacción del llamador, lo mismo que Comercial al convertir:
    /// <c>CIDDOCUMENTOORIGEN</c> en la factura; <c>CIDMOVTOORIGEN</c> y <c>CUNIDADESORIGEN</c> en sus partidas;
    /// y descuenta <c>CUNIDADESPENDIENTES</c> en las partidas y el encabezado de la cotización.
    /// Lanza <see cref="Common.Exceptions.ConflictException"/> si alguna partida ya no tiene las unidades
    /// pendientes suficientes (otra conversión o una edición la cambió mientras tanto).
    /// </summary>
    Task LigarFacturaAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        LigaFacturaCotizacion liga,
        CancellationToken cancellationToken);
}

public sealed record CotizacionParaFacturar
{
    public int IdDocumento { get; init; }
    public string Serie { get; init; } = string.Empty;
    public decimal Folio { get; init; }
    public string CodigoCliente { get; init; } = string.Empty;
    public string? CodigoAgente { get; init; }
    public string Referencia { get; init; } = string.Empty;
    public string? Observaciones { get; init; }
    public string TextoExtra1 { get; init; } = string.Empty;
    public string TextoExtra2 { get; init; } = string.Empty;
    public string TextoExtra3 { get; init; } = string.Empty;
    public string Destinatario { get; init; } = string.Empty;
    public decimal UnidadesPendientes { get; init; }
    public IReadOnlyList<MovimientoParaFacturar> Movimientos { get; set; } = [];
}

public sealed record MovimientoParaFacturar
{
    public int IdMovimiento { get; init; }
    public string CodigoProducto { get; init; } = string.Empty;
    public string CodigoAlmacen { get; init; } = string.Empty;
    public decimal Unidades { get; init; }
    public decimal UnidadesPendientes { get; init; }
    public decimal Precio { get; init; }
    public decimal PorcentajeDescuento { get; init; }
    public decimal Descuento { get; init; }
    public string? Observaciones { get; init; }
}

/// <param name="IdCotizacion">Documento de origen.</param>
/// <param name="IdFactura">Factura recién creada por el SDK.</param>
/// <param name="Partidas">Una por partida de la factura, en cualquier orden.</param>
public sealed record LigaFacturaCotizacion(
    int IdCotizacion,
    int IdFactura,
    IReadOnlyList<LigaPartida> Partidas);

/// <param name="IdMovimientoCotizacion">Partida de la cotización de donde salen las unidades.</param>
/// <param name="IdMovimientoFactura">Partida de la factura que las recibe.</param>
/// <param name="Unidades">Unidades facturadas.</param>
public sealed record LigaPartida(int IdMovimientoCotizacion, int IdMovimientoFactura, decimal Unidades);
