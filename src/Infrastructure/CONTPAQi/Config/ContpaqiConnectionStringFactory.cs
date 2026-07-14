using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Entities;
using Microsoft.Data.SqlClient;

namespace MainApi.Infrastructure.CONTPAQi.Config;

public class ContpaqiConnectionStringFactory
{
    private readonly IEncryptionService _encryptionService;

    public ContpaqiConnectionStringFactory(
        IEncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
    }

    public string BuildConnectionString(ContpaqiConexion conexion)
    {
        
        var isHomeSetup = Environment.GetEnvironmentVariable("WORK_IN_HOME") == "true";
        
        
        var builder = new SqlConnectionStringBuilder
        {
            DataSource = isHomeSetup ? "localhost,1433" : $"{conexion.Servidor},{conexion.Puerto}",
            InitialCatalog = isHomeSetup ? "adANY" : conexion.BaseDatos,
            UserID = isHomeSetup ? "sa" : conexion.SqlUser,
            Password = isHomeSetup ? "Nolose99" : _encryptionService.Decrypt(conexion.PasswordEncrypted),
            TrustServerCertificate = true,
            MultipleActiveResultSets = true
        };

        return builder.ConnectionString;
    }
}