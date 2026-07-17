namespace MainApi.Application.CONTPAQi.Documentos;

public sealed record CrearDocumentoContpaqiRequest
{
    public required DocumentoContpaqiConfig Config { get; init; }
    public required DateTime Fecha { get; init; }
    public required string Serie { get; init; }
    public required decimal Folio { get; init; }
    public int IdCliente { get; init; }
    public string RazonSocial { get; init; } = string.Empty;
    public string Rfc { get; init; } = string.Empty;
    public required int IdAgente { get; init; }
    public string Referencia { get; init; } = string.Empty;
    public string TextoExtra1 { get; init; } = string.Empty;
    public string TextoExtra2 { get; init; } = string.Empty;
    public string TextoExtra3 { get; init; } = string.Empty;
    public string? Observaciones { get; init; } = null;
    public required IReadOnlyCollection<CrearMovimientoContpaqiRequest> Movimientos { get; init; }
}

public sealed record CrearMovimientoContpaqiRequest
{
    public required int IdProducto { get; init; }
    public required int IdUnidad { get; init; }
    public required decimal Cantidad { get; init; }
    public required decimal Precio { get; init; }
    public decimal DescuentoPorcentaje { get; init; }
    public decimal Descuento { get; init; }
    public decimal Iva { get; init; }
    public decimal Isr { get; init; }
    public string? Observacion { get; init; } = null;
}
