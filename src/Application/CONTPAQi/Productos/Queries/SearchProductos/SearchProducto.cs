using System.Text;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;
using MainApi.Domain.Enums;

namespace MainApi.Application.CONTPAQi.Productos.Queries.SearchProductos;

public class SearchProductosQuery : IRequest<IEnumerable<ProductoItemDto>>
{
    public required string Search { get; init; }
    public TipoProducto[]? TiposProducto { get; init; }
    public EstatusCONTPAQi? Estatus { get; init; }
}

public class SearchProductosQueryHandler : IRequestHandler<SearchProductosQuery, IEnumerable<ProductoItemDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public SearchProductosQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<ProductoItemDto>> Handle(SearchProductosQuery request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Search))
        {
            return Enumerable.Empty<ProductoItemDto>();
        }

        await using var connection = await _sqlConnection.CreateAsync();

        var sqlBuilder = new StringBuilder("""
                                             SELECT TOP 50
                                               p.CIDPRODUCTO Id,
                                               p.CCODIGOPRODUCTO Codigo,
                                               p.CNOMBREPRODUCTO Nombre,
                                               p.CMETODOCOSTEO MetodoCosteo,
                                               p.CCONTROLEXISTENCIA ControlExistencias, 
                                               p.CIDUNIDADBASE IdUnidad,
                                               u.CNOMBREUNIDAD UnidadMedida,
                                               u.CABREVIATURA AbrevUnidadMedida,
                                               p.CSTATUSPRODUCTO Estatus,
                                               p.CPRECIO1 Precio1,
                                               p.CPRECIO2 Precio2, 
                                               p.CPRECIO3 Precio3
                                           FROM admProductos p
                                           LEFT JOIN admUnidadesMedidaPeso u  ON u.CIDUNIDAD = p.CIDUNIDADBASE
                                           WHERE p.CIDPRODUCTO > 0
                                           AND (
                                               p.CCODIGOPRODUCTO LIKE @Search
                                               OR p.CNOMBREPRODUCTO LIKE @Search
                                           )
                                           """);
        if (request.TiposProducto != null && request.TiposProducto.Any())
        {
            sqlBuilder.Append(" AND p.CTIPOPRODUCTO IN @Tipos");
        }

        if (request.Estatus.HasValue)
        {
            sqlBuilder.Append(" AND p.CSTATUSPRODUCTO = @Estatus");
        }

        sqlBuilder.Append(" ORDER BY p.CCODIGOPRODUCTO");

        var query = sqlBuilder.ToString();

        return await connection.QueryAsync<ProductoItemDto>(
            new CommandDefinition(query, new
            {
                Tipos = request.TiposProducto,
                Estatus = request.Estatus,
                Search = $"%{request.Search.Trim()}%",
            }, cancellationToken: cancellationToken));
    }
}