using System.Data;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Application.Common.Interfaces;

public interface IDocumentoContpaqiService
{
    Task<int> CrearAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken);
}
