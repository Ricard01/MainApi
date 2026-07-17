using System;
using MainApi.Domain.Enums;

namespace MainApi.Application.CONTPAQi.Documentos;

/// <summary>
/// Contiene los valores fijos y constantes para todos los documentos en CONTPAQi Comercial.
/// </summary>
public static class DocumentoContpaqiDefaults
{
    public const int AlmacenDefault = 1;
    public const int IdMoneda = 1; // 1   Pesos Mexicanos (MXN)
    public const decimal TipoCambio = 1m;
    public const int Afectado = 1;
    public const int EstadoContable = 1;
    public const int UsaCliente = 1;
    public const int SistemaOrigen = 205; // Identificador de COMERCIAL PREMIUM
    public const string Usuario = "SUPERVISOR";
    public const int BandObservaciones = 1;
    public const string TimeStamp = "07/15/2026 19:31:31:210";

    /// <summary>
    /// Fecha base requerida por CONTPAQi para campos de fecha vacíos o nulos (equivalente a 0 en su sistema legacy).
    /// </summary>
    public static readonly DateTime FechaDefault = new(1899, 12, 30);
}

/// <summary>
/// Representa la estructura de configuración requerida para  cualquier documento en CONTPAQi.
/// Todos estos campos son requeridos para crear un documento en CONTPAQi.
/// </summary>
public sealed record DocumentoContpaqiConfig
{
    /// <summary>
    /// Tipo de documento  (Cotización, Pedido, Factura, etc.). 
    /// </summary>
    public required TipoDocumento TipoDocumento { get; init; }

    /// <summary>
    /// ID del codigo del concepto  en CONTPAQi (Cotización = 1, Pedido = 2).
    /// </summary>
    public required int ConceptoDocumento { get; init; }

    /// <summary>
    /// ID del almacén asignado.
    /// </summary>
    public int AlmacenDefault { get; init; } = DocumentoContpaqiDefaults.AlmacenDefault;

    /// <summary>
    /// ID de la moneda transaccional.
    /// </summary>
    public int Moneda { get; init; } = DocumentoContpaqiDefaults.IdMoneda;

    /// <summary>
    /// Valor del tipo de cambio actual.
    /// </summary>
    public decimal TipoCambio { get; init; } = DocumentoContpaqiDefaults.TipoCambio;

    /// <summary>
    /// Naturaleza contable del movimiento 0  Cargo 1 Abono 2 Sin Naturaleza.
    /// </summary>
    public int Naturaleza { get; init; }

    /// <summary>
    /// Indica si se usa cliente o proveedor en el documento 0 No 1 Si.
    /// </summary>
    public int UsaCliente { get; init; } = DocumentoContpaqiDefaults.UsaCliente;

    /// <summary>
    /// Código del sistema origen que genera la transacción.
    /// </summary>
    public int SistemaOrigen { get; init; } = DocumentoContpaqiDefaults.SistemaOrigen;

    /// <summary>
    /// Nombre del usuario que registra el documento.
    /// </summary>
    public string Usuario { get; init; } = DocumentoContpaqiDefaults.Usuario;

    /// <summary>
    ///  Indica si el movimiento ya afectó saldos y estadísticas.
    /// </summary>
    public int Afectado { get; init; } = DocumentoContpaqiDefaults.Afectado;

    /// <summary>
    /// Estado del documento en el proceso de interfaz contable:
    /// <list type="bullet">
    /// <item><description>1 = No Contabilizado.</description></item>
    /// <item><description>2 = Pertenece a una Prepóliza de documento.</description></item>
    /// <item><description>3 = Pertenece a una Prepóliza Diaria.</description></item>
    /// <item><description>4 = Pertenece a una Prepóliza por Periodo.</description></item>
    /// <item><description>5 = Pertenece a una Póliza de documento.</description></item>
    /// <item><description>6 = Pertenece a una Póliza Diaria.</description></item>
    /// <item><description>7 = Pertenece a una Póliza por Periodo.</description></item>
    /// <item><description>8 = Pertenece a una Póliza modificada (contabilizada libremente).</description></item>
    /// </list>
    /// </summary>
    public int EstadoContable { get; init; } = DocumentoContpaqiDefaults.EstadoContable;

    /// <summary>
    ///  Bandera que indica si ya se capturaron las observaciones del documento. 
    /// </summary>
    public int BandObservaciones { get; init; } = DocumentoContpaqiDefaults.BandObservaciones;

    /// <summary>
    /// Concurrencia
    /// </summary>
    public string TimeStamp { get; init; } = DocumentoContpaqiDefaults.TimeStamp;
    
    public int Impreso { get; init; } = 0;
    public int Cancelado { get; init; } = 0;
}

/// <summary>
/// Catálogo centralizado que expone los perfiles de configuración predefinidos para la API.
/// </summary>
public static class DocumentoContpaqiConfigs
{
    /// <summary>
    /// Obtiene la configuración predeterminada para la creación de Cotizaciones.
    /// Mapea al Concepto número 1 de CONTPAQi.
    /// </summary>
    public static DocumentoContpaqiConfig Cotizacion => new()
    {
        TipoDocumento = TipoDocumento.Cotizacion,
        ConceptoDocumento = 1,
        Naturaleza = 2,
    };

    /// <summary>
    /// Obtiene la configuración predeterminada para la creación de Pedidos de clientes.
    /// Mapea al Concepto número 2 de CONTPAQi.
    /// </summary>
    public static DocumentoContpaqiConfig Pedido => new()
    {
        TipoDocumento = TipoDocumento.Pedido,
        ConceptoDocumento = 2,
        Naturaleza = 0,
    };
}