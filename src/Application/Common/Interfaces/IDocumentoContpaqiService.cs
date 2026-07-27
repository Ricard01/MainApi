using System.Data;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Application.Common.Interfaces;

/// <summary>
/// Escribe un documento y sus movimientos en las tablas de CONTPAQi.
/// La conexión y la transacción las controla quien llama para confirmar o deshacer todo junto.
/// </summary>
public interface IDocumentoContpaqiService
{
    Task<int> CrearAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken);
}
