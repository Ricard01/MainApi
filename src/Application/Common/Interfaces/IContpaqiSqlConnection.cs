using System.Data.Common;

namespace MainApi.Application.Common.Interfaces;

public interface IContpaqiSqlConnection
{
    Task<DbConnection> CreateAsync();

    /// <summary>
    /// Indica si la excepción corresponde a un error transitorio (deadlock, llave duplicada)
    /// y la operación puede reintentarse.
    /// </summary>
    bool EsErrorReintentable(Exception exception);
}
