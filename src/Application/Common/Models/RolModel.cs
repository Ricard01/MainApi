namespace MainApi.Application.Common.Models;

public class RolModel
{
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }
    public required List<int> PermisosIds { get; set; } 
}


