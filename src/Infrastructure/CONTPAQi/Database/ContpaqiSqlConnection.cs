using System.Data.Common;
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

    // 1205: deadlock. 2601 y 2627: llave o índice duplicado.
    private static readonly HashSet<int> ErroresReintentables = [1205, 2601, 2627];

    public bool EsErrorReintentable(Exception exception)
    {
        return exception is SqlException sqlException
               && sqlException.Errors
                   .Cast<SqlError>()
                   .Any(error => ErroresReintentables.Contains(error.Number));
    }

    public async Task<DbConnection> CreateAsync()
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