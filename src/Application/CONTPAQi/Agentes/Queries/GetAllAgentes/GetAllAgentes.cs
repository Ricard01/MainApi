using Dapper;
using MainApi.Application.Common.Interfaces;
// ReSharper disable All

namespace MainApi.Application.CONTPAQi.Agentes.Queries.GetAllAgentes;

public class GetAllAgentesQuery : IRequest<IEnumerable<AgenteDto>>
{
}

public class GetAllAgentesQueryHandler : IRequestHandler<GetAllAgentesQuery, IEnumerable<AgenteDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetAllAgentesQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<AgenteDto>> Handle(GetAllAgentesQuery request, CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        const string query = """
                             SELECT cidagente Id, 
                                    ccodigoagente Codigo, 
                                    cnombreagente Nombre 
                             FROM AdmAgentes
                             WHERE ctipoagente in (1,2)
                             """;

        return await connection.QueryAsync<AgenteDto>(query);
    }
}