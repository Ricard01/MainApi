using System.Text;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;
using MainApi.Domain.Enums;

namespace MainApi.Application.CONTPAQi.Documentos.Queries.GetDocumentos;

public sealed record GetDocumentosQuery : IRequest<PaginatedList<DocumentoListItem>>
{
    public required TipoDocumento TipoDocumento { get; init; }
    public required int ConceptoDocumento { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
    public string? Search { get; init; }
    public string SortBy { get; init; } = "fecha";
    public string SortDirection { get; init; } = "desc";
    public DateTime? DateFrom { get; init; }
    public DateTime? DateTo { get; init; }
    public string? Status { get; init; }
}

public sealed class GetDocumentosQueryHandler(IContpaqiSqlConnection sqlConnection)
    : IRequestHandler<GetDocumentosQuery, PaginatedList<DocumentoListItem>>
{
    private static readonly IReadOnlyDictionary<string, string> SortColumns =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["serieFolio"] = "d.CSERIEDOCUMENTO",
            ["fecha"] = "d.CFECHA",
            ["cliente"] = "d.CTEXTOEXTRA1",
            ["usuario"] = "d.CDESTINATARIO",
            ["total"] = "d.CTOTAL",
            ["estado"] = "d.CUNIDADESPENDIENTES"
        };

    public async Task<PaginatedList<DocumentoListItem>> Handle(
        GetDocumentosQuery request,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var direction = request.SortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase)
            ? "ASC"
            : "DESC";
        var sortColumn = SortColumns.GetValueOrDefault(request.SortBy, "d.CFECHA");
        var where = new StringBuilder("""
                                      WHERE d.CIDDOCUMENTODE = @TipoDocumento
                                        AND d.CIDCONCEPTODOCUMENTO = @ConceptoDocumento
                                      """);
        var parameters = new DynamicParameters(new
        {
            TipoDocumento = (int)request.TipoDocumento,
            request.ConceptoDocumento,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        });

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            where.Append("""

                           AND (
                               d.CSERIEDOCUMENTO LIKE @Search
                               OR CONVERT(varchar(30), CAST(d.CFOLIO AS decimal(18, 0))) LIKE @Search
                               OR CONCAT(d.CSERIEDOCUMENTO, CONVERT(varchar(30), CAST(d.CFOLIO AS decimal(18, 0)))) LIKE @Search
                               OR d.CTEXTOEXTRA1 LIKE @Search
                               OR d.CREFERENCIA LIKE @Search
                           )
                         """);
            parameters.Add("Search", $"%{request.Search.Trim()}%");
        }

        if (request.DateFrom.HasValue)
        {
            where.Append("\n AND d.CFECHA >= @DateFrom");
            parameters.Add("DateFrom", request.DateFrom.Value.Date);
        }

        if (request.DateTo.HasValue)
        {
            where.Append("\n AND d.CFECHA < @DateToExclusive");
            parameters.Add("DateToExclusive", request.DateTo.Value.Date.AddDays(1));
        }

        if (request.Status?.Equals("facturada", StringComparison.OrdinalIgnoreCase) == true)
        {
            where.Append("\n AND d.CUNIDADESPENDIENTES = 0");
        }
        else if (request.Status?.Equals("pendiente", StringComparison.OrdinalIgnoreCase) == true)
        {
            where.Append("\n AND d.CUNIDADESPENDIENTES <> 0");
        }

        var secondaryOrder = request.SortBy.Equals("fecha", StringComparison.OrdinalIgnoreCase)
            ? $", d.CFOLIO {direction}, d.CIDDOCUMENTO {direction}"
            : request.SortBy.Equals("serieFolio", StringComparison.OrdinalIgnoreCase)
                ? $", d.CFOLIO {direction}, d.CIDDOCUMENTO {direction}"
                : ", d.CFECHA DESC, d.CFOLIO DESC, d.CIDDOCUMENTO DESC";

        var sql = $"""
                   SELECT COUNT_BIG(1)
                   FROM admDocumentos d
                   {where};

                   SELECT
                       d.CIDDOCUMENTO AS Id,
                       d.CSERIEDOCUMENTO AS Serie,
                       d.CFOLIO AS Folio,
                       d.CFECHA AS Fecha,
                       d.CTEXTOEXTRA1 AS Cliente,
                       d.CREFERENCIA AS Contacto,
                       d.CDESTINATARIO AS Usuario,
                       d.CTOTAL AS Total,
                       CASE WHEN d.CUNIDADESPENDIENTES = 0 THEN 'facturada' ELSE 'pendiente' END AS Estado
                   FROM admDocumentos d
                   {where}
                   ORDER BY {sortColumn} {direction}{secondaryOrder}
                   OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
                   """;

        await using var connection = await sqlConnection.CreateAsync();
        using var result = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            parameters,
            cancellationToken: cancellationToken));

        var totalCount = checked((int)await result.ReadSingleAsync<long>());
        var items = (await result.ReadAsync<DocumentoListItem>()).AsList();

        return new PaginatedList<DocumentoListItem>(items, totalCount, page, pageSize);
    }
}
