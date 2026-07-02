using MainApi.Domain.Enums;

namespace MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;

public class ProductoItemDto
{
    public int Id { get; init; }
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public MetodoCosteo MetodoCosteo { get; set; }
    public int IdUnidad { get; init; }
    public required string UnidadMedida { get; init; }
    public required string AbrevUnidadMedida { get; init; }
    public double Precio1 { get; set; }
    public double Precio2 { get; set; }
    public double Precio3 { get; set; }
    public bool Estatus { get; set; }
}