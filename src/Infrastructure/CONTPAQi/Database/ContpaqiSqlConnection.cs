using MainApi.Application.Common.Interfaces;
using MainApi.Infrastructure.CONTPAQi.Config;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace MainApi.Infrastructure.CONTPAQi.Database;

public class ContpaqiSqlConnection : IContpaqiSqlConnection
{
    private readonly IAppDbContext _context;
    private readonly ContpaqiConnectionStringFactory _connectionStringFactory;

    public ContpaqiSqlConnection(IAppDbContext context, ContpaqiConnectionStringFactory connectionStringFactory)
    {
        _context = context;
        _connectionStringFactory = connectionStringFactory;
    }

    public async Task<SqlConnection> CreateAsync()
    {
        var conexion = await _context.ContpaqiConexion
            .AsNoTracking()
            .SingleOrDefaultAsync();

        if (conexion is null)
        {
            throw new InvalidOperationException(
                "No existe configuración activa de CONTPAQi.");
        }

        var connectionString = _connectionStringFactory.BuildConnectionString(conexion);

        var sqlConnection = new SqlConnection(connectionString);
        await sqlConnection.OpenAsync();
        return sqlConnection;
    }
}