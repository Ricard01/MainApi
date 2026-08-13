using System.Data;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Acumulados;
using MainApi.Application.CONTPAQi.Bitacoras;
using MainApi.Application.CONTPAQi.Documentos;
using MainApi.Application.CONTPAQi.Movimientos;

namespace MainApi.Infrastructure.CONTPAQi.Services;

/// <summary>
/// Guarda directamente en las tablas de CONTPAQi siguiendo el orden observado en SQL Profiler.
/// No confirma la transacción; el handler decide si hace commit, rollback o reintenta.
/// </summary>
public sealed class DocumentoContpaqiService(
    IBitacoraContpaqiService bitacoraService,
    IAcumuladosContpaqiService acumuladosService)
    : IDocumentoContpaqiService
{
    public async Task<int> CrearAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken)
    {
        var idDocumento = await GetLastIdFromAdmDocumentos(connection, transaction, cancellationToken);
        var idMovimiento = await GetLastIdFromAdmMovimientos(connection, transaction, cancellationToken);
        var movimientos = DocumentoContpaqiMapper.ToMovimientos(request, idDocumento, idMovimiento);

        var resumen = DocumentoContpaqiMapper.CalcularResumen(movimientos);

        var documento = DocumentoContpaqiMapper.ToDocumento(request, idDocumento, resumen);

        // Comercial primero inserta el documento en caso de que el folio y serie existan,
        // revisa el consecutivo y actualiza el folio (si la serie es diferente el folio si se puede repetir) por eso utilizamos folioDefinitivo
        await InsertDocumentoAsync(connection, transaction, documento, cancellationToken);
        var folioDefinitivo = await ObtenerFolioDisponibleAsync(
            connection,
            transaction,
            documento,
            cancellationToken);

        if (folioDefinitivo != documento.CFOLIO)
        {
            await ActualizarFolioDocumentoAsync(
                connection,
                transaction,
                documento,
                folioDefinitivo,
                cancellationToken);

            documento = documento with { CFOLIO = folioDefinitivo };
        }

        await InsertMovimientosAsync(connection, transaction, movimientos, cancellationToken);
        await acumuladosService.IncorporarCotizacionEnAcumuladosAsync(
            connection,
            transaction,
            documento,
            movimientos,
            cancellationToken);
        await ActualizarFolioConceptoAsync(connection, transaction, documento, cancellationToken);
        await bitacoraService.RegistrarDocumentoAsync(
            connection,
            transaction,
            new RegistrarBitacoraDocumentoRequest
            {
                FechaDocumento = documento.CFECHA,
                TipoDocumento = documento.CIDDOCUMENTODE,
                Serie = documento.CSERIEDOCUMENTO,
                Folio = documento.CFOLIO,
                Proceso = ProcesoBitacoraContpaqi.DocumentoCreado
            },
            cancellationToken);

        return idDocumento;
    }

    public async Task<DocumentoMutationResult> ActualizarAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken)
    {
        var existente = await ObtenerDocumentoParaMutacionAsync(
            connection, transaction, idDocumento, cancellationToken);

        if (existente is null) return DocumentoMutationResult.NotFound;
        if (existente.Documento.CUNIDADESPENDIENTES == 0) return DocumentoMutationResult.Facturada;

        var documentoAnterior = existente.Documento;
        var movimientosAnteriores = existente.Movimientos;

        var idMovimiento = await GetLastIdFromAdmMovimientos(connection, transaction, cancellationToken);
        var movimientos = DocumentoContpaqiMapper.ToMovimientos(request, idDocumento, idMovimiento);
        var resumen = DocumentoContpaqiMapper.CalcularResumen(movimientos);
        var documento = DocumentoContpaqiMapper.ToDocumento(request, idDocumento, resumen) with
        {
            CGUIDDOCUMENTO = documentoAnterior.CGUIDDOCUMENTO,
            CDESTINATARIO = documentoAnterior.CDESTINATARIO
        };

        var folioDefinitivo = await ObtenerFolioDisponibleAsync(
            connection, transaction, documento, cancellationToken);
        documento = documento with { CFOLIO = folioDefinitivo };

        await EliminarMovimientosAsync(connection, transaction, idDocumento, cancellationToken);
        await UpdateDocumentoAsync(connection, transaction, documento, cancellationToken);
        await InsertMovimientosAsync(connection, transaction, movimientos, cancellationToken);
        await acumuladosService.ReemplazarCotizacionEnAcumuladosAsync(
            connection,
            transaction,
            documentoAnterior,
            movimientosAnteriores,
            documento,
            movimientos,
            cancellationToken);
        await ActualizarFolioConceptoAsync(connection, transaction, documento, cancellationToken);
        await bitacoraService.RegistrarDocumentoAsync(
            connection,
            transaction,
            new RegistrarBitacoraDocumentoRequest
            {
                FechaDocumento = documento.CFECHA,
                TipoDocumento = documento.CIDDOCUMENTODE,
                Serie = documento.CSERIEDOCUMENTO,
                Folio = documento.CFOLIO,
                Proceso = ProcesoBitacoraContpaqi.DocumentoModificado
            },
            cancellationToken);

        return DocumentoMutationResult.Success;
    }

    public async Task<DocumentoMutationResult> EliminarAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CancellationToken cancellationToken)
    {
        var existente = await ObtenerDocumentoParaMutacionAsync(
            connection, transaction, idDocumento, cancellationToken);

        if (existente is null) return DocumentoMutationResult.NotFound;
        if (existente.Documento.CUNIDADESPENDIENTES == 0) return DocumentoMutationResult.Facturada;

        await acumuladosService.RetirarCotizacionDeAcumuladosAsync(
            connection,
            transaction,
            existente.Documento,
            existente.Movimientos,
            cancellationToken);
        await EliminarMovimientosAsync(connection, transaction, idDocumento, cancellationToken);

        var filas = await connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM admDocumentos WHERE CIDDOCUMENTO = @IdDocumento;",
            new { IdDocumento = idDocumento },
            transaction,
            cancellationToken: cancellationToken));

        if (filas != 1)
        {
            throw new DBConcurrencyException($"No fue posible eliminar el documento {idDocumento}.");
        }

        await bitacoraService.RegistrarDocumentoAsync(
            connection,
            transaction,
            new RegistrarBitacoraDocumentoRequest
            {
                FechaDocumento = existente.Documento.CFECHA,
                TipoDocumento = existente.Documento.CIDDOCUMENTODE,
                Serie = existente.Documento.CSERIEDOCUMENTO,
                Folio = existente.Documento.CFOLIO,
                Proceso = ProcesoBitacoraContpaqi.DocumentoBorrado
            },
            cancellationToken);

        return DocumentoMutationResult.Success;
    }

    private static async Task<DocumentoParaMutacion?> ObtenerDocumentoParaMutacionAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT TOP (1)
                               CIDDOCUMENTO, CIDDOCUMENTODE, CIDCONCEPTODOCUMENTO,
                               CSERIEDOCUMENTO, CFOLIO, CFECHA, CIDCLIENTEPROVEEDOR,
                               CIDAGENTE, CUNIDADESPENDIENTES, CDESTINATARIO, CGUIDDOCUMENTO
                           FROM admDocumentos WITH (UPDLOCK, HOLDLOCK)
                           WHERE CIDDOCUMENTO = @IdDocumento
                             AND CIDDOCUMENTODE = 1
                             AND CIDCONCEPTODOCUMENTO = 1;

                           SELECT
                               CIDMOVIMIENTO, CIDDOCUMENTO, CNUMEROMOVIMIENTO, CIDDOCUMENTODE,
                               CIDPRODUCTO, CUNIDADES, CIDUNIDAD, CPRECIO, CNETO,
                               CDESCUENTO1, CPORCENTAJEDESCUENTO1, CIMPUESTO1,
                               CRETENCION1, CTOTAL, COBSERVAMOV, CUNIDADESPENDIENTES
                           FROM admMovimientos WITH (UPDLOCK, HOLDLOCK)
                           WHERE CIDDOCUMENTO = @IdDocumento;
                           """;

        using var result = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            new { IdDocumento = idDocumento },
            transaction,
            cancellationToken: cancellationToken));

        var documento = await result.ReadSingleOrDefaultAsync<AdmDocumentos>();
        if (documento is null) return null;

        var movimientos = (await result.ReadAsync<AdmMovimientos>()).AsList();
        return new DocumentoParaMutacion(documento, movimientos);
    }

    private static Task EliminarMovimientosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        int idDocumento,
        CancellationToken cancellationToken)
    {
        return connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM admMovimientos WHERE CIDDOCUMENTO = @IdDocumento;",
            new { IdDocumento = idDocumento },
            transaction,
            cancellationToken: cancellationToken));
    }

    private static async Task UpdateDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           UPDATE admDocumentos
                           SET CSERIEDOCUMENTO = @Serie,
                               CFOLIO = @Folio,
                               CFECHA = @Fecha,
                               CIDCLIENTEPROVEEDOR = @IdCliente,
                               CRAZONSOCIAL = @RazonSocial,
                               CIDAGENTE = @IdAgente,
                               CFECHAVENCIMIENTO = @Fecha,
                               CFECHAPRONTOPAGO = @Fecha,
                               CFECHAENTREGARECEPCION = @Fecha,
                               CFECHAULTIMOINTERES = @Fecha,
                               CREFERENCIA = @Referencia,
                               COBSERVACIONES = @Observaciones,
                               CNETO = @Neto,
                               CIMPUESTO1 = @Iva,
                               CRETENCION1 = @Isr,
                               CDESCUENTOMOV = @Descuento,
                               CTOTAL = @Total,
                               CPENDIENTE = @Total,
                               CTOTALUNIDADES = @TotalUnidades,
                               CUNIDADESPENDIENTES = @TotalUnidades,
                               CIMPCHEQPAQ = @Total,
                               CTEXTOEXTRA1 = @Cliente,
                               CTEXTOEXTRA2 = @Email,
                               CTEXTOEXTRA3 = @Telefono,
                               CBANOBSERVACIONES = @BandObservaciones,
                               CTIMESTAMP = @Timestamp
                           WHERE CIDDOCUMENTO = @IdDocumento
                             AND CUNIDADESPENDIENTES <> 0;
                           """;

        var filas = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Serie = ToContpaqiVarChar(documento.CSERIEDOCUMENTO, AdmDocumentosColumnLengths.SerieDocumento),
                Folio = ToContpaqiFloat(documento.CFOLIO),
                Fecha = documento.CFECHA,
                IdCliente = documento.CIDCLIENTEPROVEEDOR,
                RazonSocial = ToContpaqiVarChar(documento.CRAZONSOCIAL, AdmDocumentosColumnLengths.RazonSocial),
                IdAgente = documento.CIDAGENTE,
                Referencia = ToContpaqiVarChar(documento.CREFERENCIA, AdmDocumentosColumnLengths.Referencia),
                Observaciones =
                    ToNullableContpaqiVarChar(documento.COBSERVACIONES, AdmDocumentosColumnLengths.Observaciones),
                Neto = ToContpaqiFloat(documento.CNETO),
                Iva = ToContpaqiFloat(documento.CIMPUESTO1),
                Isr = ToContpaqiFloat(documento.CRETENCION1),
                Descuento = ToContpaqiFloat(documento.CDESCUENTOMOV),
                Total = ToContpaqiFloat(documento.CTOTAL),
                TotalUnidades = ToContpaqiFloat(documento.CTOTALUNIDADES),
                Cliente = ToContpaqiVarChar(documento.CTEXTOEXTRA1, AdmDocumentosColumnLengths.TextoExtra),
                Email = ToContpaqiVarChar(documento.CTEXTOEXTRA2, AdmDocumentosColumnLengths.TextoExtra),
                Telefono = ToContpaqiVarChar(documento.CTEXTOEXTRA3, AdmDocumentosColumnLengths.TextoExtra),
                BandObservaciones = documento.CBANOBSERVACIONES,
                Timestamp = ToContpaqiVarChar(documento.CTIMESTAMP, AdmDocumentosColumnLengths.TimeStamp),
                IdDocumento = documento.CIDDOCUMENTO
            },
            transaction,
            cancellationToken: cancellationToken));

        if (filas != 1)
        {
            throw new DBConcurrencyException($"No fue posible actualizar el documento {documento.CIDDOCUMENTO}.");
        }
    }

    private sealed record DocumentoParaMutacion(
        AdmDocumentos Documento,
        IReadOnlyCollection<AdmMovimientos> Movimientos);

    /// <summary>
    /// Obtiene el Ultimo Id de AdmDocumentos para utilizar en el insert ya que CIDDOCUMENTO no es Autoincrement 
    /// </summary>
    /// <returns></returns>
    private static Task<int> GetLastIdFromAdmDocumentos(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT ISNULL(
                               (
                                   SELECT TOP (1) CIDDOCUMENTO
                                   FROM admDocumentos
                                   ORDER BY CIDDOCUMENTO DESC
                               ),
                               0
                           ) + 1;
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    // Garantiza que, si dos procesos intentan usar la misma serie y folio el sistema incremente automáticamente el folio
    // hasta encontrar el primer folio no utilizado en la base de datos.
    private static async Task<decimal> ObtenerFolioDisponibleAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        CancellationToken cancellationToken)
    {
        // Excluimos el documento recién insertado. Si otro documento ya tiene el
        // mismo tipo, serie y folio, probamos el número siguiente.
        const string sql = """
                           SELECT TOP (1) CIDDOCUMENTO
                           FROM admDocumentos
                           WHERE CIDDOCUMENTODE = @TipoDocumento
                             AND CSERIEDOCUMENTO = @Serie
                             AND CFOLIO = @Folio
                             AND CIDDOCUMENTO <> @IdDocumento;
                           """;

        var folio = documento.CFOLIO;

        while (true)
        {
            var documentoDuplicado = await connection.QuerySingleOrDefaultAsync<int?>(
                new CommandDefinition(
                    sql,
                    new
                    {
                        TipoDocumento = (int)documento.CIDDOCUMENTODE,
                        Serie = ToContpaqiVarChar(
                            documento.CSERIEDOCUMENTO,
                            AdmDocumentosColumnLengths.SerieDocumento),
                        Folio = ToContpaqiFloat(folio),
                        IdDocumento = documento.CIDDOCUMENTO
                    },
                    transaction,
                    cancellationToken: cancellationToken));

            if (documentoDuplicado is null)
            {
                return folio;
            }

            folio++;
        }
    }

    private static async Task ActualizarFolioDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        decimal folioDefinitivo,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           UPDATE admDocumentos
                           SET CFOLIO = @FolioDefinitivo
                           WHERE CIDDOCUMENTO = @IdDocumento
                             AND CFOLIO = @FolioOriginal;
                           """;

        var filasActualizadas = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                FolioDefinitivo = ToContpaqiFloat(folioDefinitivo),
                FolioOriginal = ToContpaqiFloat(documento.CFOLIO),
                IdDocumento = documento.CIDDOCUMENTO
            },
            transaction,
            cancellationToken: cancellationToken));

        if (filasActualizadas != 1)
        {
            throw new DBConcurrencyException(
                $"No fue posible actualizar el folio del documento {documento.CIDDOCUMENTO}.");
        }
    }

    /// <summary>
    /// Obtiene el Ultimo Id de AdmMoviimentos para utilizar en el insert ya que CIDMOVIMIENTO no es Autoincrement
    /// </summary>
    /// <returns></returns>
    private static Task<int> GetLastIdFromAdmMovimientos(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        // CIDMOVIMIENTO también es global. Si alguien ocupa uno de estos IDs antes del insert, la llave duplicada provoca el reintento de toda la cotización.
        const string sql = """
                           SELECT ISNULL(
                               (
                                   SELECT TOP (1) CIDMOVIMIENTO
                                   FROM admMovimientos
                                   ORDER BY CIDMOVIMIENTO DESC
                               ),
                               0
                           ) + 1;
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    private static Task InsertDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           INSERT INTO admDocumentos
                           (
                               CIDDOCUMENTO,
                               CIDDOCUMENTODE,
                               CIDCONCEPTODOCUMENTO,
                               CSERIEDOCUMENTO,
                               CFOLIO,
                               CFECHA,
                               CIDCLIENTEPROVEEDOR,
                               CRAZONSOCIAL,
                               CRFC,
                               CIDAGENTE,
                               CFECHAVENCIMIENTO,
                               CFECHAPRONTOPAGO,
                               CFECHAENTREGARECEPCION,
                               CFECHAULTIMOINTERES,
                               CIDMONEDA,
                               CTIPOCAMBIO,
                               CREFERENCIA,
                               COBSERVACIONES,
                               CNATURALEZA,
                               CUSACLIENTE,
                               CAFECTADO,
                               CIMPRESO,
                               CCANCELADO,
                               CESTADOCONTABLE,
                               CNETO,
                               CIMPUESTO1,
                               CRETENCION1,
                               CDESCUENTOMOV,
                               CTOTAL,
                               CPENDIENTE,
                               CTOTALUNIDADES,
                               CTEXTOEXTRA1,
                               CTEXTOEXTRA2,
                               CTEXTOEXTRA3,
                               CDESTINATARIO,
                               CBANOBSERVACIONES,
                               CTIMESTAMP,
                               CUNIDADESPENDIENTES,
                               CIMPCHEQPAQ,
                               CGUIDDOCUMENTO,
                               CUSUARIO,
                               CSISTORIG
                           )
                           VALUES
                           (
                               @CIDDOCUMENTO,
                               @CIDDOCUMENTODE,
                               @CIDCONCEPTODOCUMENTO,
                               @CSERIEDOCUMENTO,
                               @CFOLIO,
                               @CFECHA,
                               @CIDCLIENTEPROVEEDOR,
                               @CRAZONSOCIAL,
                               @CRFC,
                               @CIDAGENTE,
                               @CFECHAVENCIMIENTO,
                               @CFECHAPRONTOPAGO,
                               @CFECHAENTREGARECEPCION,
                               @CFECHAULTIMOINTERES,
                               @CIDMONEDA,
                               @CTIPOCAMBIO,
                               @CREFERENCIA,
                               @COBSERVACIONES,
                               @CNATURALEZA,
                               @CUSACLIENTE,
                               @CAFECTADO,
                               @CIMPRESO,
                               @CCANCELADO,
                               @CESTADOCONTABLE,
                               @CNETO,
                               @CIMPUESTO1,
                               @CRETENCION1,
                               @CDESCUENTOMOV,
                               @CTOTAL,
                               @CPENDIENTE,
                               @CTOTALUNIDADES,
                               @CTEXTOEXTRA1,
                               @CTEXTOEXTRA2,
                               @CTEXTOEXTRA3,
                               @CDESTINATARIO,
                               @CBANOBSERVACIONES,
                               @CTIMESTAMP,
                               @CUNIDADESPENDIENTES,
                               @CIMPCHEQPAQ,
                               @CGUIDDOCUMENTO,
                               @CUSUARIO,
                               @CSISTORIG
                           );
                           """;

        return connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                documento.CIDDOCUMENTO,
                CIDDOCUMENTODE = (int)documento.CIDDOCUMENTODE,
                documento.CIDCONCEPTODOCUMENTO,
                CSERIEDOCUMENTO =
                    ToContpaqiVarChar(documento.CSERIEDOCUMENTO, AdmDocumentosColumnLengths.SerieDocumento),
                CFOLIO = ToContpaqiFloat(documento.CFOLIO),
                documento.CFECHA,
                documento.CIDCLIENTEPROVEEDOR,
                CRAZONSOCIAL = ToContpaqiVarChar(documento.CRAZONSOCIAL, AdmDocumentosColumnLengths.RazonSocial),
                CRFC = ToContpaqiVarChar(documento.CRFC, AdmDocumentosColumnLengths.Rfc),
                documento.CIDAGENTE,
                documento.CFECHAVENCIMIENTO,
                documento.CFECHAPRONTOPAGO,
                documento.CFECHAENTREGARECEPCION,
                documento.CFECHAULTIMOINTERES,
                documento.CIDMONEDA,
                CTIPOCAMBIO = ToContpaqiFloat(documento.CTIPOCAMBIO),
                CREFERENCIA = ToContpaqiVarChar(documento.CREFERENCIA, AdmDocumentosColumnLengths.Referencia),
                COBSERVACIONES =
                    ToNullableContpaqiVarChar(documento.COBSERVACIONES, AdmDocumentosColumnLengths.Observaciones),
                documento.CNATURALEZA,
                documento.CUSACLIENTE,
                documento.CAFECTADO,
                documento.CIMPRESO,
                documento.CCANCELADO,
                documento.CESTADOCONTABLE,
                CNETO = ToContpaqiFloat(documento.CNETO),
                CIMPUESTO1 = ToContpaqiFloat(documento.CIMPUESTO1),
                CRETENCION1 = ToContpaqiFloat(documento.CRETENCION1),
                CDESCUENTOMOV = ToContpaqiFloat(documento.CDESCUENTOMOV),
                CTOTAL = ToContpaqiFloat(documento.CTOTAL),
                CPENDIENTE = ToContpaqiFloat(documento.CPENDIENTE),
                CTOTALUNIDADES = ToContpaqiFloat(documento.CTOTALUNIDADES),
                CTEXTOEXTRA1 = ToContpaqiVarChar(documento.CTEXTOEXTRA1, AdmDocumentosColumnLengths.TextoExtra),
                CTEXTOEXTRA2 = ToContpaqiVarChar(documento.CTEXTOEXTRA2, AdmDocumentosColumnLengths.TextoExtra),
                CTEXTOEXTRA3 = ToContpaqiVarChar(documento.CTEXTOEXTRA3, AdmDocumentosColumnLengths.TextoExtra),
                CDESTINATARIO = ToContpaqiVarChar(documento.CDESTINATARIO, AdmDocumentosColumnLengths.Destinatario),
                documento.CBANOBSERVACIONES,
                CTIMESTAMP = ToContpaqiVarChar(documento.CTIMESTAMP, AdmDocumentosColumnLengths.TimeStamp),
                CUNIDADESPENDIENTES = ToContpaqiFloat(documento.CUNIDADESPENDIENTES),
                CIMPCHEQPAQ = ToContpaqiFloat(documento.CIMPCHEQPAQ),
                CGUIDDOCUMENTO = ToContpaqiVarChar(documento.CGUIDDOCUMENTO, AdmDocumentosColumnLengths.GuidDocumento),
                CUSUARIO = ToContpaqiVarChar(documento.CUSUARIO, AdmDocumentosColumnLengths.Usuario),
                documento.CSISTORIG
            },
            transaction,
            cancellationToken: cancellationToken));
    }

    private static async Task InsertMovimientosAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        IEnumerable<AdmMovimientos> movimientos,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           INSERT INTO admMovimientos
                           (
                               CIDMOVIMIENTO,
                               CIDDOCUMENTO,
                               CNUMEROMOVIMIENTO,
                               CIDDOCUMENTODE,
                               CIDPRODUCTO,
                               CIDALMACEN,
                               CUNIDADES,
                               CUNIDADESCAPTURADAS,
                               CIDUNIDAD,
                               CPRECIO,
                               CPRECIOCAPTURADO,
                               CNETO,
                               CDESCUENTO1,
                               CPORCENTAJEDESCUENTO1,
                               CIMPUESTO1,
                               CPORCENTAJEIMPUESTO1,
                               CRETENCION1,
                               CPORCENTAJERETENCION1,
                               CTOTAL,
                               COBSERVAMOV,
                               CAFECTAEXISTENCIA,
                               CAFECTADOSALDOS,
                               CFECHA,
                               CUNIDADESPENDIENTES,
                               CTIPOTRASPASO,
                               COBJIMPU01
                           )
                           VALUES
                           (
                               @CIDMOVIMIENTO,
                               @CIDDOCUMENTO,
                               @CNUMEROMOVIMIENTO,
                               @CIDDOCUMENTODE,
                               @CIDPRODUCTO,
                               @CIDALMACEN,
                               @CUNIDADES,
                               @CUNIDADES,
                               @CIDUNIDAD,
                               @CPRECIO,
                               @CPRECIO,
                               @CNETO,
                               @CDESCUENTO1,
                               @CPORCENTAJEDESCUENTO1,
                               @CIMPUESTO1,
                               @CPORCENTAJEIMPUESTO1,
                               @CRETENCION1,
                               @CPORCENTAJERETENCION1,
                               @CTOTAL,
                               @COBSERVAMOV,
                               @CAFECTAEXISTENCIA,
                               @CAFECTADOSALDOS,
                               @CFECHA,
                               @CUNIDADESPENDIENTES,
                               @CTIPOTRASPASO,
                               @COBJIMPU01
                           );
                           """;

        foreach (var movimiento in movimientos)
        {
            await connection.ExecuteAsync(new CommandDefinition(
                sql,
                new
                {
                    movimiento.CIDMOVIMIENTO,
                    movimiento.CIDDOCUMENTO,
                    movimiento.CNUMEROMOVIMIENTO,
                    CIDDOCUMENTODE = (int)movimiento.CIDDOCUMENTODE,
                    movimiento.CIDPRODUCTO,
                    movimiento.CIDALMACEN,
                    CUNIDADES = ToContpaqiFloat(movimiento.CUNIDADES),
                    movimiento.CIDUNIDAD,
                    CPRECIO = ToContpaqiFloat(movimiento.CPRECIO),
                    CNETO = ToContpaqiFloat(movimiento.CNETO),
                    CDESCUENTO1 = ToContpaqiFloat(movimiento.CDESCUENTO1),
                    CPORCENTAJEDESCUENTO1 = ToContpaqiFloat(movimiento.CPORCENTAJEDESCUENTO1),
                    CIMPUESTO1 = ToContpaqiFloat(movimiento.CIMPUESTO1),
                    CPORCENTAJEIMPUESTO1 = ToContpaqiFloat(movimiento.CPORCENTAJEIMPUESTO1),
                    CRETENCION1 = ToContpaqiFloat(movimiento.CRETENCION1),
                    CPORCENTAJERETENCION1 = ToContpaqiFloat(movimiento.CPORCENTAJERETENCION1),
                    CTOTAL = ToContpaqiFloat(movimiento.CTOTAL),
                    COBSERVAMOV = ToNullableContpaqiVarChar(movimiento.COBSERVAMOV,
                        AdmMovimientosColumnLengths.Observaciones),
                    movimiento.CAFECTAEXISTENCIA,
                    movimiento.CAFECTADOSALDOS,
                    movimiento.CFECHA,
                    CUNIDADESPENDIENTES = movimiento.CUNIDADESPENDIENTES,
                    movimiento.CTIPOTRASPASO,
                    movimiento.COBJIMPU01
                },
                transaction,
                cancellationToken: cancellationToken));
        }
    }

    private static Task ActualizarFolioConceptoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        AdmDocumentos documento,
        CancellationToken cancellationToken)
    {
        // CNOFOLIO guarda el último folio usado. El CASE evita regresarlo si  Comercial ya alcanzó un folio mayor.
        const string sql = """
                           UPDATE admConceptos
                           SET CNOFOLIO =
                               CASE
                                   WHEN CNOFOLIO < @Folio THEN @Folio
                                   ELSE CNOFOLIO
                               END
                           WHERE CIDCONCEPTODOCUMENTO = @Concepto
                           """;

        return connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Folio = ToContpaqiFloat(documento.CFOLIO),
                Concepto = documento.CIDCONCEPTODOCUMENTO,
            },
            transaction,
            cancellationToken: cancellationToken));
    }

    // CONTPAQi. uso el tipo de datos FLOAT
    private static double ToContpaqiFloat(decimal value)
    {
        return decimal.ToDouble(value);
    }

    private static DbString ToContpaqiVarChar(string? value, int length)
    {
        var text = value ?? string.Empty;

        return new DbString
        {
            Value = text.Length <= length ? text : text[..length],
            IsAnsi = true,
            IsFixedLength = false,
            Length = length
        };
    }

    private static DbString ToNullableContpaqiVarChar(string? value, int length)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return new DbString
            {
                Value = null,
                IsAnsi = true,
                IsFixedLength = false,
                Length = length
            };
        }

        return ToContpaqiVarChar(value, length);
    }
}
