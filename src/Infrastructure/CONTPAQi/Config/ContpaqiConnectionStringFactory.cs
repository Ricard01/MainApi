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
        var builder = new SqlConnectionStringBuilder
        {
            DataSource = $"{conexion.Servidor},{conexion.Puerto}",
            InitialCatalog = conexion.BaseDatos,
            UserID = conexion.SqlUser,
            Password = _encryptionService.Decrypt(conexion.PasswordEncrypted),
            TrustServerCertificate = true
        };

        return builder.ConnectionString;
    }
}