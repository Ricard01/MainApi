using System.Data;
using System.Globalization;
using Dapper;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Bitacoras;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Infrastructure.CONTPAQi.Services;

/// <summary>
/// Registra en admBitacoras las operaciones realizadas por la Web API.
/// La transacción es compartida con la operación que originó la entrada.
/// </summary>
public sealed class BitacoraContpaqiService(IUser currentUser) : IBitacoraContpaqiService
{
    private const int IdSistema = 205;
    private const string Equipo = "WEBAPI";

    public async Task RegistrarDocumentoAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        RegistrarBitacoraDocumentoRequest request,
        CancellationToken cancellationToken)
    {
        var idBitacora = await ObtenerSiguienteIdAsync(
            connection,
            transaction,
            cancellationToken);

        var tipoDocumento = request.TipoDocumento.ToString();
        var ahora = DateTime.Now;

        const string sql = """
                           INSERT INTO admBitacoras
                           (
                               IDBITACORA,
                               FECHA,
                               HORA,
                               USUARIO,
                               NOMBRE,
                               USUARIO2,
                               NOMBRE2,
                               PROCESO,
                               DATOS,
                               IDSISTEMA,
                               CTEXTOEX01,
                               CTEXTOEX02,
                               CTEXTOEX03,
                               CFECHAEX01,
                               CIMPORTE01,
                               CIMPORTE02,
                               CIMPORTE03,
                               EQUIPO
                           )
                           VALUES
                           (
                               @IdBitacora,
                               @Fecha,
                               @Hora,
                               @Usuario,
                               @Nombre,
                               @Usuario2,
                               @Nombre2,
                               @Proceso,
                               @Datos,
                               @IdSistema,
                               @TextoExtra01,
                               @TextoExtra02,
                               @TextoExtra03,
                               @FechaExtra01,
                               @Importe01,
                               @Importe02,
                               @Importe03,
                               @Equipo
                           );
                           """;

        var filasInsertadas = await connection.ExecuteAsync(new CommandDefinition(
            sql,
            new
            {
                IdBitacora = idBitacora,
                Fecha = ahora.Date,
                Hora = ahora.ToString("HHmm", CultureInfo.InvariantCulture),
                Usuario = currentUser.UserName?.ToUpper() ?? string.Empty,
                Nombre = currentUser.Nombre?.ToUpper() ?? string.Empty,
                Usuario2 = string.Empty,
                Nombre2 = string.Empty,
                Proceso = ObtenerDescripcion(request.Proceso),
                Datos = $"{tipoDocumento} {request.Serie.Trim()} {FormatearFolio(request.Folio)}".Trim(),
                IdSistema,
                TextoExtra01 = tipoDocumento,
                TextoExtra02 = string.Empty,
                TextoExtra03 = request.FechaDocumento.ToString("MM/dd/yyyy 00:00:00:000", CultureInfo.InvariantCulture),
                FechaExtra01 = DocumentoContpaqiDefaults.FechaDefault,
                Importe01 = 0d,
                Importe02 = 0d,
                Importe03 = 0d,
                Equipo
            },
            transaction,
            cancellationToken: cancellationToken));

        if (filasInsertadas != 1)
        {
            throw new DBConcurrencyException(
                $"No fue posible registrar la bitácora {idBitacora} de CONTPAQi.");
        }
    }

    private static Task<int> ObtenerSiguienteIdAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT ISNULL(MAX(IDBITACORA), 0) + 1
                           FROM admBitacoras;
                           """;

        return connection.QuerySingleAsync<int>(new CommandDefinition(
            sql,
            transaction: transaction,
            cancellationToken: cancellationToken));
    }

    private static string ObtenerDescripcion(ProcesoBitacoraContpaqi proceso)
    {
        return proceso switch
        {
            ProcesoBitacoraContpaqi.DocumentoCreado => "Documento Creado",
            ProcesoBitacoraContpaqi.DocumentoModificado => "Documento Modificado",
            ProcesoBitacoraContpaqi.DocumentoBorrado => "Documento Borrado",
            ProcesoBitacoraContpaqi.DocumentoCancelado => "Documento Cancelado",
            _ => throw new ArgumentOutOfRangeException(nameof(proceso), proceso, null)
        };
    }

    private static string FormatearFolio(decimal folio)
    {
        return folio.ToString("0.############################", CultureInfo.InvariantCulture);
    }
}
