namespace MainApi.Application.CONTPAQi.Agentes.Queries.GetAllAgentes;

public class AgenteDto
{
    public int Id { get; set; }
    public required string Codigo { get; set; }
    public required string Nombre { get; set; }
}