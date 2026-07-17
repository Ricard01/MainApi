using MainApi.Domain.Enums;
// ReSharper disable InconsistentNaming

namespace MainApi.Application.CONTPAQi.Documentos;

// representación parcial de una fila de AdmDocumentos, si solamente se insertan las columnas con datos que realmente se modifican el resto usa defaults, es más sencillo y reduce errores. 
public sealed record admDocumentosRow
{
    public int CIDDOCUMENTO { get; init; }
    public TipoDocumento CIDDOCUMENTODE { get; init; }
    public int CIDCONCEPTODOCUMENTO { get; init; }
    public string CSERIEDOCUMENTO { get; init; } = string.Empty;
    public decimal CFOLIO { get; init; }
    public DateTime CFECHA { get; init; }
    public int CIDCLIENTEPROVEEDOR { get; init; }
    public string CRAZONSOCIAL { get; init; } = string.Empty;
    public string CRFC { get; init; } = string.Empty;
    public int CIDAGENTE { get; init; }
    public DateTime CFECHAVENCIMIENTO { get; init; }
    public DateTime CFECHAPRONTOPAGO { get; init; }
    public DateTime CFECHAENTREGARECEPCION { get; init; }
    public DateTime CFECHAULTIMOINTERES { get; init; }
    public int CIDMONEDA { get; init; }
    public decimal CTIPOCAMBIO { get; init; }
    public string CREFERENCIA { get; init; } = string.Empty;
    public string? COBSERVACIONES { get; init; } = null;
    public int CNATURALEZA { get; init; }
    public int CUSACLIENTE { get; init; }
    public int CAFECTADO { get; init; }
    public int CIMPRESO { get; init; }
    public int CCANCELADO { get; init; }
    public int CESTADOCONTABLE { get; init; }
    public decimal CNETO { get; init; }
    public decimal CIMPUESTO1 { get; init; }
    public decimal CRETENCION1 { get; init; }
    public decimal CDESCUENTOMOV { get; init; }
    public decimal CTOTAL { get; init; }
    public decimal CPENDIENTE { get; init; }
    public decimal CTOTALUNIDADES { get; init; }
    public string CTEXTOEXTRA1  { get; init; } = string.Empty;
    public string CTEXTOEXTRA2  { get; init; } = string.Empty;
    public string CTEXTOEXTRA3  { get; init; } = string.Empty;
    public string CDESTINATARIO  { get; init; } = string.Empty;
    public int CBANOBSERVACIONES { get; init; }
    public string CTIMESTAMP { get; init; } = string.Empty;
    public decimal CUNIDADESPENDIENTES { get; init; }
    public decimal CIMPCHEQPAQ { get; init; }
    public string CGUIDDOCUMENTO { get; init; } = string.Empty;
    public string CUSUARIO { get; init; } = string.Empty;
    public int CSISTORIG { get; init; }
}

public sealed record admMovimientoRow
{
    public int CIDMOVIMIENTO { get; init; }
    public int CIDDOCUMENTO { get; init; }
    public int CNUMEROMOVIMIENTO { get; init; }
    public TipoDocumento CIDDOCUMENTODE { get; init; }
    public int CIDPRODUCTO { get; init; }
    public int CIDALMACEN { get; init; }
    public decimal CUNIDADES { get; init; }
    public int CIDUNIDAD { get; init; }
    public decimal CPRECIO { get; init; }
    public decimal CNETO { get; init; }
    public decimal CDESCUENTO1 { get; init; }
    public decimal CPORCENTAJEDESCUENTO1 { get; init; }
    public decimal CIMPUESTO1 { get; init; }
    public decimal CPORCENTAJEIMPUESTO1 { get; init; }
    public decimal CRETENCION1 { get; init; }
    public decimal CPORCENTAJERETENCION1 { get; init; }
    public decimal CTOTAL { get; init; }
    public string? COBSERVAMOV { get; init; } = null;
    public DateTime CFECHA { get; init; }
}

public sealed record DocumentoResumen(
    decimal Neto,
    decimal Descuento,
    decimal Iva,
    decimal Isr,
    decimal Total,
    decimal TotalUnidades);
