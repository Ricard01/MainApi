namespace MainApi.Application.CONTPAQi.Documentos.Queries.GetDocumentos;

/// <summary>
/// Proyección común para los listados de documentos de CONTPAQi.
/// Los módulos deciden qué columnas exponen y qué acciones habilitan.
/// </summary>
public sealed record DocumentoListItem
{
    public int Id { get; init; }
    public string Serie { get; init; } = string.Empty;
    public decimal Folio { get; init; }
    public DateTime Fecha { get; init; }
    public string Cliente { get; init; } = string.Empty;
    public string Contacto { get; init; } = string.Empty;
    public string Usuario { get; init; } = string.Empty;
    public decimal Total { get; init; }
    public string Estado { get; init; } = string.Empty;
}
