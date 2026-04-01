// Application/Common/Models/GridQueryExtensions.cs

using System.Linq.Expressions;

namespace MainApi.Application.Common.Models;

public static class GridQueryExtensions
{
    // ========= SORT =========
    public static IOrderedQueryable<T> ApplySortingOrDefault<T>(
        this IQueryable<T> query,
        string? sortBy,
        string? sortDir,
        IReadOnlyDictionary<string, LambdaExpression> sortMap,
        LambdaExpression defaultKey,
        LambdaExpression? tieBreaker = null)
    {
        var desc = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        var key  = !string.IsNullOrWhiteSpace(sortBy) && sortMap.TryGetValue(sortBy, out var found)
            ? found
            : defaultKey;

        var ordered = ApplyOrderBy(query, key, asc: !desc);
        if (tieBreaker != null)
            ordered = ApplyThenBy(ordered, tieBreaker, asc: true);
        return ordered;
    }

    private static IOrderedQueryable<T> ApplyOrderBy<T>(IQueryable<T> source, LambdaExpression keySelector, bool asc)
    {
        var method = asc ? nameof(Queryable.OrderBy) : nameof(Queryable.OrderByDescending);
        var call = Expression.Call(
            typeof(Queryable),
            method,
            new[] { typeof(T), keySelector.Body.Type },
            source.Expression,
            Expression.Quote(keySelector));
        return (IOrderedQueryable<T>)source.Provider.CreateQuery<T>(call);
    }

    private static IOrderedQueryable<T> ApplyThenBy<T>(IOrderedQueryable<T> source, LambdaExpression keySelector, bool asc)
    {
        var method = asc ? nameof(Queryable.ThenBy) : nameof(Queryable.ThenByDescending);
        var call = Expression.Call(
            typeof(Queryable),
            method,
            new[] { typeof(T), keySelector.Body.Type },
            source.Expression,
            Expression.Quote(keySelector));
        return (IOrderedQueryable<T>)source.Provider.CreateQuery<T>(call);
    }

    // ========= LIKE helper =========
    // Escapa comodines y arma el patrón con % según conveniencia.
    public static string LikeContains(string value)
        => $"%{EscapeLike(value)}%";

    public static string LikeStartsWith(string value)
        => $"{EscapeLike(value)}%";

    public static string LikeEndsWith(string value)
        => $"%{EscapeLike(value)}";

    private static string EscapeLike(string value)
        => value.Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");

    // ========= SEARCH GLOBAL (OR entre campos) =========
    public static IQueryable<T> ApplySearch<T>(
        this IQueryable<T> query,
        string? search,
        params Expression<Func<T, string?>>[] fields)
    {
        if (string.IsNullOrWhiteSpace(search) || fields.Length == 0) return query;
        var s = search.Trim();

        // Usaremos LIKE '%s%' (contains)
        var pattern = LikeContains(s);
        var param = Expression.Parameter(typeof(T), "x");
        Expression? body = null;

        foreach (var f in fields)
        {
            var replaced = new ReplaceParameterVisitor(f.Parameters[0], param).Visit(f.Body)!;

            // EF.Functions.Like(replaced, pattern)
            var likeCall = Expression.Call(
                typeof(DbFunctionsExtensions),
                nameof(DbFunctionsExtensions.Like),
                Type.EmptyTypes,
                Expression.Constant(EF.Functions),
                replaced,
                Expression.Constant(pattern));

            body = body == null ? likeCall : Expression.OrElse(body, likeCall);
        }

        var lambda = Expression.Lambda<Func<T, bool>>(body!, param);
        return query.Where(lambda);
    }

    private sealed class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _from, _to;
        public ReplaceParameterVisitor(ParameterExpression from, ParameterExpression to) { _from = from; _to = to; }
        protected override Expression VisitParameter(ParameterExpression node) => node == _from ? _to : base.VisitParameter(node);
    }

    // ========= FILTERS =========
    public sealed record FilterRule<T>(Func<IQueryable<T>, string, IQueryable<T>> Apply);

    public static IQueryable<T> ApplyFilters<T>(
        this IQueryable<T> query,
        IReadOnlyDictionary<string,string> filters,
        IReadOnlyDictionary<string, FilterRule<T>> rules)
    {
        if (filters is null || filters.Count == 0) return query;

        foreach (var (key, raw) in filters)
        {
            if (string.IsNullOrWhiteSpace(raw)) continue;
            if (!rules.TryGetValue(key, out var rule)) continue;
            query = rule.Apply(query, raw);
        }
        return query;
    }
}
