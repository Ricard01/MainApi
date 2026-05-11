using MainApi.Application.Common.Interfaces;
using Dapper;

namespace MainApi.Infrastructure.CONTPAQi.Queries;

public class ClienteQueries
{
    private readonly IContpaqiSqlConnection _connection;

    public ClienteQueries(IContpaqiSqlConnection connection)
    {
        _connection = connection;
    }

    public async Task<IEnumerable<dynamic>> ObtenerClientesAsync()
    {
        using var connection = await _connection.CreateAsync();

        var sql = """
                      SELECT
                          CIDCLIENTEPROVEEDOR,
                          CRAZONSOCIAL
                      FROM admClientes
                  """;

        return await connection.QueryAsync(sql);
    }
}