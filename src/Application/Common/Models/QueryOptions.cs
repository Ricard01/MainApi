namespace MainApi.Application.Common.Models;

public sealed record QueryOptions
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public string? Search { get; init; }
    public string? SortBy { get; init; }
    public string? SortDir { get; init; } = "asc"; // "asc" | "desc"

    // // Clave→Valor. Ej: { "estatus":"Activo", "hospitalId":"..." }
    // public Dictionary<string, string> Filters { get; init; } = new(StringComparer.OrdinalIgnoreCase);
}
