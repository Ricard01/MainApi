using System.Data;
using MainApi.Application.CONTPAQi.Documentos;
using MainApi.Application.CONTPAQi.Movimientos;

namespace MainApi.Application.CONTPAQi.Acumulados;

public interface IAcumuladosContpaqiService
{
    Task ActualizarCotizacionAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        CancellationToken cancellationToken);
}
