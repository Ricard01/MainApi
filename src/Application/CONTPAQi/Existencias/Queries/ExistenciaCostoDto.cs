namespace MainApi.Application.CONTPAQi.Existencias.Queries;

public class ExistenciaCostoDto
{
    public double Existencia { get; set; }
    public double CostoPromedio { get; init; }
    public double UltimoCosto { get; init; }
}