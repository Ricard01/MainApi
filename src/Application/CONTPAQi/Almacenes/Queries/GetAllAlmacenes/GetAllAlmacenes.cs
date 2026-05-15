using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Almacenes.Queries.GetAllAlmacenes;

public class GetAllAlmacenesQuery : IRequest<IEnumerable<AlmacenDto>>
{
}

public class GetAllAlmacenesQueryHandler : IRequestHandler<GetAllAlmacenesQuery, IEnumerable<AlmacenDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetAllAlmacenesQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<AlmacenDto>> Handle(GetAllAlmacenesQuery request, CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        const string query = """
                             SELECT cidalmacen Id, 
                                    ccodigoalmacen Codigo, 
                                    cnombrealmacen Nombre 
                             FROM AdmAlmacenes
                             WHERE cidalmacen>0 AND cidalmacen <>2;
                             """;

        return await connection.QueryAsync<AlmacenDto>(query);
    }
}