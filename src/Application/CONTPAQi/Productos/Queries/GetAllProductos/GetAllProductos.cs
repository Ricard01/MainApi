using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;

public class GetAllProductosQuery : IRequest<IEnumerable<ProductoItemDto>> { }

public class GetAllProductosQueryHandler : IRequestHandler<GetAllProductosQuery, IEnumerable<ProductoItemDto>>
{
 
    private readonly IContpaqiSqlConnection _sqlConnection;
    
    public GetAllProductosQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }
    
    public async Task<IEnumerable<ProductoItemDto>> Handle(GetAllProductosQuery request, CancellationToken cancellationToken)
    {
        using var connection = await _sqlConnection.CreateAsync(); 
        
        var query = """
                      SELECT
                          CCODIGOPRODUCTO AS CodigoProducto,
                          CNOMBREPRODUCTO AS Nombre
                      FROM admProductos
                  """;
        
        return await connection.QueryAsync<ProductoItemDto>(query);
    }
}