namespace MainApi.Application.Common.Models;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int TotalPages { get; }
    public int TotalCount { get; }
    public int PageSize { get; }

    public PaginatedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        PageSize   = pageSize;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }

    public bool HasPreviousPage => PageNumber > 1;

    public bool HasNextPage => PageNumber < TotalPages;

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize,CancellationToken ct = default)
    {
        var count = await source.CountAsync(ct);
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}
public static class PaginationExtensions
{
    // Único helper oficial de paginación. Evita duplicar este método en otros archivos.
    public static Task<PaginatedList<T>> PaginatedListAsync<T>(
        this IQueryable<T> source, int page, int size, CancellationToken ct = default)
        => PaginatedList<T>.CreateAsync(source, page, size, ct);

    // Azúcar cuando proyectas manualmente a DTO con Select(...)
    public static Task<PaginatedList<TDto>> SelectPageAsync<TEntity, TDto>(
        this IQueryable<TEntity> queryable,
        System.Linq.Expressions.Expression<Func<TEntity, TDto>> selector,
        int pageNumber,
        int pageSize,
        CancellationToken ct = default)
    {
        var projected = queryable.Select(selector);
        return PaginatedList<TDto>.CreateAsync(projected, pageNumber, pageSize, ct);
    }
}
