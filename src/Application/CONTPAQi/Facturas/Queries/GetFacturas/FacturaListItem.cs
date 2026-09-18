namespace MainApi.Application.CONTPAQi.Facturas.Queries.GetFacturas;

/// <summary>
/// Campos en la vista de Facturas.
/// </summary>
public sealed record FacturaListItem
{
    public int Id { get; init; }
    public DateTime Fecha { get; init; }
    public string Serie { get; init; } = string.Empty;
    public decimal Folio { get; init; }
    public string Cliente { get; init; } = string.Empty;
    public decimal Total { get; init; }
    public decimal Pendiente { get; init; } 
    public string Agente { get; init; } = string.Empty;
}