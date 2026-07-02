using System.Text;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Enums;


namespace MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;

public class GetAllProductosQuery : IRequest<IEnumerable<ProductoItemDto>>
{
   public TipoProducto[]? Tipos { get; init; }
    public EstatusCONTPAQi? Estatus { get; set; } = EstatusCONTPAQi.Activo;
}

public class GetAllProductosQueryHandler : IRequestHandler<GetAllProductosQuery, IEnumerable<ProductoItemDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetAllProductosQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<ProductoItemDto>> Handle(GetAllProductosQuery request,
        CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        var sqlBuilder = new StringBuilder("""
                                               SELECT
                                                   cidproducto  Id,
                                                   ccodigoproducto  Codigo,
                                                   cnombreproducto  Nombre
                                               FROM admProductos
                                               WHERE cidproducto>0
                                           """);
        if (request.Tipos != null && request.Tipos.Any())
        {
            sqlBuilder.Append(" AND ctipoproducto IN @Tipos");
        }

        if (request.Estatus.HasValue)
        {
            sqlBuilder.Append(" AND cstatusproducto = @Estatus");
        }

        var query = sqlBuilder.ToString();
    
        return await connection.QueryAsync<ProductoItemDto>(
            new CommandDefinition(query, new
            {
                Tipos = request.Tipos,
                Estatus = request.Estatus
            }, cancellationToken: cancellationToken));
    }
}