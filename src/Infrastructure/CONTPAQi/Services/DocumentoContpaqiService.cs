using System.Data;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Infrastructure.CONTPAQi.Services;

public sealed class DocumentoContpaqiService : IDocumentoContpaqiService
{
    public async Task<int> CrearAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CrearDocumentoContpaqiRequest request,
        CancellationToken cancellationToken)
    {
        // 1. Reservamos el siguiente CIDDOCUMENTO dentro de la transaccion recibida.
        var idDocumento = await ObtenerSiguienteIdDocumentoAsync(connection, transaction, cancellationToken);

        // Modo debug: por ahora solo insertamos admDocumentos.
        // var idMovimientoInicial = await ObtenerSiguienteIdMovimientoAsync(connection, transaction, cancellationToken);
        // var movimientos = DocumentoContpaqiMapper.ToMovimientos(request, idDocumento, idMovimientoInicial);
        var movimientos = DocumentoContpaqiMapper.ToMovimientos(request, idDocumento, idMovimientoInicial: 0);

        // 2. Calculamos importes del documento a partir de sus movimientos.
        var resumen = DocumentoContpaqiMapper.CalcularResumen(movimientos);

        // 3. Armamos la fila de admDocumentos que se va a insertar.
        var documento = DocumentoContpaqiMapper.ToDocumento(request, idDocumento, resumen);

        // 4. En este modo debug solo se inserta el encabezado del documento.
        await InsertDocumentoAsync(connection, transaction, documento, cancellationToken);

        // await InsertMovimientosAsync(connection, transaction, movimientos, cancellationToken);
        // await ActualizarFolioConceptoAsync(connection, transaction, documento, cancellationToken);

        // Pendiente: admAcumulados debe copiarse/validarse contra SQL Profiler.
        // No conviene inventarlo porque CONTPAQi actualiza varios tipos/dimensiones.

        return idDocumento;
    }

    private static Task<int> ObtenerSiguienteIdDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT ISNULL(MAX(CIDDOCUMENTO), 0) + 1
                           FROM admDocumentos WITH (UPDLOCK, HOLDLOCK);
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    private static Task<int> ObtenerSiguienteIdMovimientoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT ISNULL(MAX(CIDMOVIMIENTO), 0) + 1
                           FROM admMovimientos WITH (UPDLOCK, HOLDLOCK);
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    private static Task InsertDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        admDocumentosRow documento,
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
                CSERIEDOCUMENTO = ToContpaqiVarChar(documento.CSERIEDOCUMENTO, AdmDocumentosColumnLengths.SerieDocumento),
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
                COBSERVACIONES = ToNullableContpaqiVarChar(documento.COBSERVACIONES, AdmDocumentosColumnLengths.Observaciones),
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
        IEnumerable<admMovimientoRow> movimientos,
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
                               CFECHA,
                               CAFECTADOSALDOS,
                               CAFECTADOINVENTARIO
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
                               @CFECHA,
                               0,
                               0
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
                    COBSERVAMOV = ToNullableContpaqiVarChar(movimiento.COBSERVAMOV, AdmMovimientosColumnLengths.Observaciones),
                    movimiento.CFECHA
                },
                transaction,
                cancellationToken: cancellationToken));
            }
    }

    private static Task ActualizarFolioConceptoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        admDocumentosRow documento,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           UPDATE admConceptos
                           SET CNOFOLIO = @Folio
                           WHERE CIDCONCEPTODOCUMENTO = @Concepto
                             AND CSERIEPOROMISION = @Serie;
                           """;

        return connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                Folio = ToContpaqiFloat(documento.CFOLIO),
                Concepto = documento.CIDCONCEPTODOCUMENTO,
                Serie = documento.CSERIEDOCUMENTO
            },
            transaction,
            cancellationToken: cancellationToken));
    }

    private static double ToContpaqiFloat(decimal value)
    {
        // Conversion explicita al tipo que corresponde con SQL Server float en tablas CONTPAQi.
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
