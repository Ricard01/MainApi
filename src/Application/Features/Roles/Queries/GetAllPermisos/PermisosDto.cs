namespace MainApi.Application.Features.Roles.Queries.GetAllPermisos;

public class PermisosDto
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public required string Modulo { get; set; }
    public string? Descripcion { get; set; }
}