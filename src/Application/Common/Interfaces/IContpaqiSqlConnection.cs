using Microsoft.Data.SqlClient;

namespace MainApi.Application.Common.Interfaces;

public interface IContpaqiSqlConnection
{
    Task<SqlConnection> CreateAsync();
}