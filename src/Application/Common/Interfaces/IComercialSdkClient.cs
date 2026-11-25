using MainApi.Application.CONTPAQi.Facturas.ComercialSdk;

namespace MainApi.Application.Common.Interfaces;

/// <summary>
/// Cliente HTTP del servicio SDK de CONTPAQi Comercial (proceso x86 aparte que envuelve MGWServicios.dll).
/// Se usa para los documentos que el SDK debe crear (facturas: impuestos, inventario, saldos y folio digital).
/// Lanza <see cref="Exceptions.ValidationException"/> si el servicio rechaza los datos
/// y <see cref="Exceptions.ComercialSdkException"/> ante cualquier otro error o si no responde.
/// </summary>
public interface IComercialSdkClient
{
    Task<FacturaSdkCreada> CrearFacturaAsync(NuevaFacturaSdk factura, CancellationToken cancellationToken);

    /// <summary>Borra una factura sin timbrar; sirve para deshacer una factura recién creada.</summary>
    Task BorrarFacturaAsync(int idDocumento, CancellationToken cancellationToken);
}
