namespace MainApi.Application.CONTPAQi.Movimientos;

public sealed record MovimientosConfig
{
    public int AfectaExistencia { get; init; }
    public int AfectaSaldos { get; init; }
    public int TipoTraspaso { get; init; }
    public string ObjetoImpuesto01 { get; init; } = string.Empty;
}