namespace MainApi.Application.CONTPAQi.Almacenes.Queries.GetAllAlmacenes;

public class AlmacenDto
{
    public int Id { get; set; }
    public required string Codigo { get; set; }
    public required string Nombre { get; set; }
}