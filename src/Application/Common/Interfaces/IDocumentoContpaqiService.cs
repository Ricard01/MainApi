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

    Task<DocumentoMutationResult> ActualizarAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken);

    Task<DocumentoMutationResult> EliminarAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CancellationToken cancellationToken);
}

public enum DocumentoMutationResult
{
    Success,
    NotFound,
    Facturada
}
