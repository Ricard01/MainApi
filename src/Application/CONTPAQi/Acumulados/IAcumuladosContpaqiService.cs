using System.Data;
using MainApi.Application.CONTPAQi.Documentos;
using MainApi.Application.CONTPAQi.Movimientos;

namespace MainApi.Application.CONTPAQi.Acumulados;

/// <summary>
/// Mantiene los acumulados de cotizaciones que CONTPAQi utiliza para sus estadísticas mensuales.
/// Todas las modificaciones se realizan con la conexión y transacción proporcionadas para que
/// permanezcan atómicas respecto a la creación, actualización o eliminación del documento.
/// </summary>
public interface IAcumuladosContpaqiService
{
    /// <summary>
    /// Incorpora por primera vez las unidades e importes de una cotización en los acumulados.
    /// </summary>
    /// <param name="connection">Conexión abierta a la empresa de CONTPAQi.</param>
    /// <param name="transaction">Transacción que contiene la mutación del documento.</param>
    /// <param name="documento">Encabezado del que se obtienen fecha, cliente y agente.</param>
    /// <param name="movimientos">Partidas usadas para calcular unidades e importes netos.</param>
    /// <param name="cancellationToken">Token para cancelar la operación.</param>
    Task IncorporarCotizacionEnAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        CancellationToken cancellationToken);

    /// <summary>
    /// Retira de los acumulados las unidades e importes aportados por una cotización existente.
    /// </summary>
    /// <param name="connection">Conexión abierta a la empresa de CONTPAQi.</param>
    /// <param name="transaction">Transacción que contiene la mutación del documento.</param>
    /// <param name="documento">Encabezado original de la cotización.</param>
    /// <param name="movimientos">Partidas originales cuyo impacto debe retirarse.</param>
    /// <param name="cancellationToken">Token para cancelar la operación.</param>
    Task RetirarCotizacionDeAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        CancellationToken cancellationToken);

    /// <summary>
    /// Sustituye en los acumulados el impacto de una cotización por el de su versión actualizada.
    /// Primero retira los valores anteriores y después incorpora los nuevos dentro de la misma transacción.
    /// </summary>
    /// <param name="connection">Conexión abierta a la empresa de CONTPAQi.</param>
    /// <param name="transaction">Transacción que contiene la actualización del documento.</param>
    /// <param name="documentoAnterior">Encabezado de la cotización antes de la actualización.</param>
    /// <param name="movimientosAnteriores">Partidas existentes antes de la actualización.</param>
    /// <param name="documentoNuevo">Encabezado actualizado de la cotización.</param>
    /// <param name="movimientosNuevos">Partidas que reemplazarán a las anteriores.</param>
    /// <param name="cancellationToken">Token para cancelar la operación.</param>
    Task ReemplazarCotizacionEnAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documentoAnterior,
        IReadOnlyCollection<AdmMovimientos> movimientosAnteriores,
        AdmDocumentos documentoNuevo,
        IReadOnlyCollection<AdmMovimientos> movimientosNuevos,
        CancellationToken cancellationToken);
}
