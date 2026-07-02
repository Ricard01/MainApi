namespace MainApi.Application.CONTPAQi.Productos.Queries.GetUnidadesMedida;

public class UnidadMedidaDto
{
    public int Id { get; init; }
    public required string Nombre { get; init; }
    public required string Abreviatura { get; init; }
    public bool EsPrincipal { get; init; }
}