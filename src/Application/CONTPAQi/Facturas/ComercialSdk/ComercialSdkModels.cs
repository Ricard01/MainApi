namespace MainApi.Application.CONTPAQi.Facturas.ComercialSdk;

/// <summary>
/// Petición para <c>POST /api/facturas</c> del servicio SDK de CONTPAQi (proyecto CONTPAQi, x86).
/// Los nombres y tipos coinciden con <c>NuevaFactura</c> de ese servicio; los opcionales nulos no se escriben.
/// </summary>
public sealed record NuevaFacturaSdk
{
    public required string CodigoConcepto { get; init; }
    public required DateOnly Fecha { get; init; }
    public required string CodigoCliente { get; init; }
    public string? Referencia { get; init; }
    public required IReadOnlyList<NuevoMovimientoSdk> Movimientos { get; init; }
    public string? CodigoAgente { get; init; }
    public string? Observaciones { get; init; }
    public string? TextoExtra1 { get; init; }
    public string? TextoExtra2 { get; init; }
    public string? TextoExtra3 { get; init; }
    public string? Destinatario { get; init; }
}

/// <summary>Partida de <see cref="NuevaFacturaSdk"/>; coincide con <c>NuevoMovimiento</c> del servicio SDK.</summary>
public sealed record NuevoMovimientoSdk
{
    public required string CodigoProducto { get; init; }
    public required string CodigoAlmacen { get; init; }
    public required double Unidades { get; init; }
    public required double Precio { get; init; }
    public string? Observaciones { get; init; }
    public double? PorcentajeDescuento { get; init; }
    public double? ImporteDescuento { get; init; }
}

/// <summary>
/// Respuesta del servicio SDK al crear una factura. <see cref="IdMovimientos"/> viene en el mismo orden
/// que <see cref="NuevaFacturaSdk.Movimientos"/>.
/// </summary>
public sealed record FacturaSdkCreada(
    int IdDocumento,
    string CodigoConcepto,
    string Serie,
    double Folio,
    IReadOnlyList<int> IdMovimientos);
