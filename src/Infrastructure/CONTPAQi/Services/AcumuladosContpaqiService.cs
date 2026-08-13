using System.Data;
using System.Globalization;
using Dapper;
using MainApi.Application.CONTPAQi.Acumulados;
using MainApi.Application.CONTPAQi.Documentos;
using MainApi.Application.CONTPAQi.Movimientos;

namespace MainApi.Infrastructure.CONTPAQi.Services;

/// <summary>
/// Mantiene sincronizados los acumulados mensuales de cotizaciones en CONTPAQi.
/// Calcula los totales por cliente, producto y agente, y los aplica en el periodo
/// correspondiente sin confirmar la transacción recibida.
/// </summary>
public sealed class AcumuladosContpaqiService : IAcumuladosContpaqiService
{
    private const int IdMonedaPesos = 1;
    private const int ImporteModeloUnidades = 1;
    private const int ImporteModeloNeto = 27;

    private const int AcumuladoTotalCotizaciones = 1;
    private const int AcumuladoCotizacionesCliente = 2;
    private const int AcumuladoCotizacionesClienteProducto = 3;
    private const int AcumuladoCotizacionesProducto = 4;
    private const int AcumuladoCotizacionesAgenteProducto = 140;
    private const decimal FactorIncremento = 1m;
    private const decimal FactorDecremento = -1m;

    /// <inheritdoc />
    public Task IncorporarCotizacionEnAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        CancellationToken cancellationToken)
    {
        return AplicarAjusteAsync(
            connection,
            transaction,
            documento,
            movimientos,
            FactorIncremento,
            cancellationToken);
    }

    /// <inheritdoc />
    public Task RetirarCotizacionDeAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        CancellationToken cancellationToken)
    {
        return AplicarAjusteAsync(
            connection,
            transaction,
            documento,
            movimientos,
            FactorDecremento,
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task ReemplazarCotizacionEnAcumuladosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documentoAnterior,
        IReadOnlyCollection<AdmMovimientos> movimientosAnteriores,
        AdmDocumentos documentoNuevo,
        IReadOnlyCollection<AdmMovimientos> movimientosNuevos,
        CancellationToken cancellationToken)
    {
        await AplicarAjusteAsync(
            connection,
            transaction,
            documentoAnterior,
            movimientosAnteriores,
            FactorDecremento,
            cancellationToken);

        await AplicarAjusteAsync(
            connection,
            transaction,
            documentoNuevo,
            movimientosNuevos,
            FactorIncremento,
            cancellationToken);
    }

    /// <summary>
    /// Calcula y aplica un ajuste con signo a todos los acumulados afectados por una cotización.
    /// </summary>
    private async Task AplicarAjusteAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        decimal factor,
        CancellationToken cancellationToken)
    {
        var idEjercicio = await ObtenerIdEjercicioAsync(
            connection,
            transaction,
            documento.CFECHA.Year,
            cancellationToken);

        var acumulados = CrearAcumulados(documento, movimientos, factor);

        foreach (var acumulado in acumulados)
        {
            await ActualizarOInsertarAsync(
                connection,
                transaction,
                acumulado,
                idEjercicio,
                documento.CFECHA.Month,
                cancellationToken);
        }
    }

    /// <summary>
    /// Agrupa las partidas por producto y construye los ajustes que requiere cada tipo de
    /// acumulado de CONTPAQi. El factor determina si los importes se agregan o se retiran.
    /// </summary>
    private static IReadOnlyCollection<AcumuladoCotizacion> CrearAcumulados(
        AdmDocumentos documento,
        IReadOnlyCollection<AdmMovimientos> movimientos,
        decimal factor)
    {
        var productos = movimientos
            .GroupBy(movimiento => movimiento.CIDPRODUCTO)
            .Select(grupo => new
            {
                IdProducto = grupo.Key,
                Unidades = grupo.Sum(movimiento => movimiento.CUNIDADES),
                Neto = grupo.Sum(movimiento => movimiento.CNETO - movimiento.CDESCUENTO1)
            })
            .ToArray();

        var netoTotal = productos.Sum(producto => producto.Neto);
        var acumulados = new List<AcumuladoCotizacion>
        {
            new(
                AcumuladoTotalCotizaciones,
                0,
                0,
                ImporteModeloNeto,
                netoTotal * factor),
            new(
                AcumuladoCotizacionesCliente,
                documento.CIDCLIENTEPROVEEDOR,
                0,
                ImporteModeloNeto,
                netoTotal * factor)
        };

        foreach (var producto in productos)
        {
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesClienteProducto,
                documento.CIDCLIENTEPROVEEDOR,
                producto.IdProducto,
                ImporteModeloUnidades,
                producto.Unidades * factor));
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesClienteProducto,
                documento.CIDCLIENTEPROVEEDOR,
                producto.IdProducto,
                ImporteModeloNeto,
                producto.Neto * factor));
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesProducto,
                producto.IdProducto,
                0,
                ImporteModeloUnidades,
                producto.Unidades * factor));
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesProducto,
                producto.IdProducto,
                0,
                ImporteModeloNeto,
                producto.Neto * factor));
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesAgenteProducto,
                documento.CIDAGENTE,
                producto.IdProducto,
                ImporteModeloUnidades,
                producto.Unidades * factor));
            acumulados.Add(new AcumuladoCotizacion(
                AcumuladoCotizacionesAgenteProducto,
                documento.CIDAGENTE,
                producto.IdProducto,
                ImporteModeloNeto,
                producto.Neto * factor));
        }

        return acumulados;
    }

    /// <summary>
    /// Obtiene la llave interna del ejercicio contable al que pertenece la cotización.
    /// </summary>
    private static Task<int> ObtenerIdEjercicioAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int ejercicio,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT CIDEJERCICIO
                           FROM admEjercicios
                           WHERE CEJERCICIO = @Ejercicio;
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            new { Ejercicio = ejercicio },
            transaction,
            cancellationToken: cancellationToken));
    }

    /// <summary>
    /// Suma el ajuste al registro mensual existente o crea el registro cuando todavía no existe.
    /// Los bloqueos evitan que dos transacciones creen o modifiquen simultáneamente la misma clave.
    /// </summary>
    private static async Task ActualizarOInsertarAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AcumuladoCotizacion acumulado,
        int idEjercicio,
        int periodo,
        CancellationToken cancellationToken)
    {
        const string updateSql = """
                                 UPDATE admAcumulados WITH (UPDLOCK, HOLDLOCK)
                                 SET CIMPORTEPERIODO1 = ISNULL(CIMPORTEPERIODO1, 0) + CASE WHEN @Periodo = 1 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO2 = ISNULL(CIMPORTEPERIODO2, 0) + CASE WHEN @Periodo = 2 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO3 = ISNULL(CIMPORTEPERIODO3, 0) + CASE WHEN @Periodo = 3 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO4 = ISNULL(CIMPORTEPERIODO4, 0) + CASE WHEN @Periodo = 4 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO5 = ISNULL(CIMPORTEPERIODO5, 0) + CASE WHEN @Periodo = 5 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO6 = ISNULL(CIMPORTEPERIODO6, 0) + CASE WHEN @Periodo = 6 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO7 = ISNULL(CIMPORTEPERIODO7, 0) + CASE WHEN @Periodo = 7 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO8 = ISNULL(CIMPORTEPERIODO8, 0) + CASE WHEN @Periodo = 8 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO9 = ISNULL(CIMPORTEPERIODO9, 0) + CASE WHEN @Periodo = 9 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO10 = ISNULL(CIMPORTEPERIODO10, 0) + CASE WHEN @Periodo = 10 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO11 = ISNULL(CIMPORTEPERIODO11, 0) + CASE WHEN @Periodo = 11 THEN @Importe ELSE 0 END,
                                     CIMPORTEPERIODO12 = ISNULL(CIMPORTEPERIODO12, 0) + CASE WHEN @Periodo = 12 THEN @Importe ELSE 0 END,
                                     CTIMESTAMP = @Timestamp
                                 WHERE CIDTIPOACUMULADO = @IdTipoAcumulado
                                   AND CIDOWNER1 = @IdOwner1
                                   AND CIDOWNER2 = @IdOwner2
                                   AND CIMPORTEMODELO = @ImporteModelo
                                   AND CIDEJERCICIO = @IdEjercicio
                                   AND CIDMONEDA = @IdMoneda;
                                 """;

        var parametros = CrearParametros(acumulado, idEjercicio, periodo);
        var filasActualizadas = await connection.ExecuteAsync(new CommandDefinition(
            updateSql,
            parametros,
            transaction,
            cancellationToken: cancellationToken));

        if (filasActualizadas == 1)
        {
            return;
        }

        if (filasActualizadas > 1)
        {
            throw new DBConcurrencyException(
                "Existe más de un registro para la misma clave en admAcumulados.");
        }

        var idAcumulado = await ObtenerSiguienteIdAsync(
            connection,
            transaction,
            cancellationToken);

        const string insertSql = """
                                 INSERT INTO admAcumulados
                                 (
                                     CIDACUMULADO,
                                     CIDTIPOACUMULADO,
                                     CIDOWNER1,
                                     CIDOWNER2,
                                     CIMPORTEMODELO,
                                     CIDEJERCICIO,
                                     CIMPORTEINICIAL,
                                     CIDMONEDA,
                                     CIMPORTEPERIODO1,
                                     CIMPORTEPERIODO2,
                                     CIMPORTEPERIODO3,
                                     CIMPORTEPERIODO4,
                                     CIMPORTEPERIODO5,
                                     CIMPORTEPERIODO6,
                                     CIMPORTEPERIODO7,
                                     CIMPORTEPERIODO8,
                                     CIMPORTEPERIODO9,
                                     CIMPORTEPERIODO10,
                                     CIMPORTEPERIODO11,
                                     CIMPORTEPERIODO12,
                                     CTIMESTAMP
                                 )
                                 VALUES
                                 (
                                     @IdAcumulado,
                                     @IdTipoAcumulado,
                                     @IdOwner1,
                                     @IdOwner2,
                                     @ImporteModelo,
                                     @IdEjercicio,
                                     0,
                                     @IdMoneda,
                                     CASE WHEN @Periodo = 1 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 2 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 3 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 4 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 5 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 6 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 7 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 8 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 9 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 10 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 11 THEN @Importe ELSE 0 END,
                                     CASE WHEN @Periodo = 12 THEN @Importe ELSE 0 END,
                                     @Timestamp
                                 );
                                 """;

        parametros.Add("IdAcumulado", idAcumulado);
        var filasInsertadas = await connection.ExecuteAsync(new CommandDefinition(
            insertSql,
            parametros,
            transaction,
            cancellationToken: cancellationToken));

        if (filasInsertadas != 1)
        {
            throw new DBConcurrencyException(
                $"No fue posible insertar el acumulado {idAcumulado} de CONTPAQi.");
        }
    }

    /// <summary>
    /// Traduce un ajuste de dominio a los parámetros esperados por admAcumulados.
    /// </summary>
    private static DynamicParameters CrearParametros(
        AcumuladoCotizacion acumulado,
        int idEjercicio,
        int periodo)
    {
        var parametros = new DynamicParameters();
        parametros.Add("IdTipoAcumulado", acumulado.IdTipoAcumulado);
        parametros.Add("IdOwner1", acumulado.IdOwner1);
        parametros.Add("IdOwner2", acumulado.IdOwner2);
        parametros.Add("ImporteModelo", acumulado.ImporteModelo);
        parametros.Add("IdEjercicio", idEjercicio);
        parametros.Add("IdMoneda", IdMonedaPesos);
        parametros.Add("Periodo", periodo);
        parametros.Add("Importe", decimal.ToDouble(acumulado.Importe));
        parametros.Add(
            "Timestamp",
            DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss:fff", CultureInfo.InvariantCulture));
        return parametros;
    }

    /// <summary>
    /// Reserva el siguiente identificador de admAcumulados dentro de la transacción actual.
    /// </summary>
    private static Task<int> ObtenerSiguienteIdAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT ISNULL(MAX(CIDACUMULADO), 0) + 1
                           FROM admAcumulados WITH (UPDLOCK, HOLDLOCK);
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    /// <summary>
    /// Representa un importe que debe aplicarse a una combinación única de tipo, propietarios y modelo.
    /// </summary>
    private sealed record AcumuladoCotizacion(
        int IdTipoAcumulado,
        int IdOwner1,
        int IdOwner2,
        int ImporteModelo,
        decimal Importe);
}
