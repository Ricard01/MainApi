using System.Data;

namespace MainApi.Application.CONTPAQi.Bitacoras;

public interface IBitacoraContpaqiService
{
    Task RegistrarDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        RegistrarBitacoraDocumentoRequest request,
        CancellationToken cancellationToken);
}
