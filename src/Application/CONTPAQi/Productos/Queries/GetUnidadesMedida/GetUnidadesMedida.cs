using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Productos.Queries.GetUnidadesMedida;

public class GetUnidadesMedidaProductoQuery : IRequest<IEnumerable<UnidadMedidaDto>>
{
    public int ProductoId { get; init; }
}

public class GetUnidadesMedidaProductoQueryHandler
    : IRequestHandler<GetUnidadesMedidaProductoQuery, IEnumerable<UnidadMedidaDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetUnidadesMedidaProductoQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<UnidadMedidaDto>> Handle(
        GetUnidadesMedidaProductoQuery request,
        CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        const string query = """
                             SELECT
                                 u.CIDUNIDAD Id,
                                 u.CNOMBREUNIDAD Nombre,
                                 u.CABREVIATURA Abreviatura,
                                 CAST(1 AS bit) EsPrincipal
                             FROM admProductos p
                             JOIN admUnidadesMedidaPeso u
                                 ON u.CIDUNIDAD = p.CIDUNIDADBASE
                             WHERE p.CIDPRODUCTO = @ProductoId

                             UNION ALL

                             SELECT
                                 u.CIDUNIDAD Id,
                                 u.CNOMBREUNIDAD Nombre,
                                 u.CABREVIATURA Abreviatura,
                                 CAST(0 AS bit) EsPrincipal
                             FROM admProductos p
                             JOIN admConversionesUnidad c
                                 ON c.CIDUNIDAD2 = p.CIDUNIDADBASE
                             JOIN admUnidadesMedidaPeso u
                                 ON u.CIDUNIDAD = c.CIDUNIDAD1
                             WHERE p.CIDPRODUCTO = @ProductoId
                             """;

        return await connection.QueryAsync<UnidadMedidaDto>(
            new CommandDefinition(
                query,
                new { request.ProductoId },
                cancellationToken: cancellationToken));
    }
}
