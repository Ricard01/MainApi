namespace MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;

public class ProductoItemDto
{
    public int Id { get; init; }
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public int IdUnidad { get; init; }
    public required string UnidadMedida { get; init; }
    public required string AbrevUnidadMedida { get; init; }
}