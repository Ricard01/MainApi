using MainApi.Domain.Enums;

namespace MainApi.Application.CONTPAQi.Bitacoras;

/// <summary>
/// Datos variables de una entrada de bitácora. Los valores fijos y el usuario
/// autenticado son responsabilidad de la implementación.
/// </summary>
public sealed record RegistrarBitacoraDocumentoRequest
{
    public required DateTime FechaDocumento { get; init; }
    public required TipoDocumento TipoDocumento { get; init; }
    public required string Serie { get; init; }
    public required decimal Folio { get; init; }
    public required ProcesoBitacoraContpaqi Proceso { get; init; }
}
