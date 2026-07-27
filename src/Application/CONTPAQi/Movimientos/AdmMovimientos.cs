using MainApi.Domain.Enums;
// ReSharper disable InconsistentNaming
namespace MainApi.Application.CONTPAQi.Movimientos;

/// <summary>
/// Campos necesarios para crear un movimiento en CONTPAQi el resto toma el valor predeterminado (0).
/// </summary>
public sealed record AdmMovimientos
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
    public int CAFECTAEXISTENCIA { get; init; }
    public int CAFECTADOSALDOS { get; init; }
    public DateTime CFECHA { get; init; }
    public decimal CUNIDADESPENDIENTES { get; init; }
    public int CTIPOTRASPASO { get; init; }
    public required string COBJIMPU01 { get; init; }
}