namespace MainApi.Application.Common.Models;

/// <summary>
/// Modelo para la vista de GetRolById con sus permisos
/// </summary>
public class RolModel
{
    public Guid Id { get; set; }
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }
    public required List<PermisoModel> Permisos { get; set; }
}

public class RolListModel
{
    public Guid Id { get; set; }
    public required string Nombre { get; set; }
    public string? Descripcion { get; set; }
}

public class RolCreateModel
{
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }
    public required List<int> PermisosIds { get; set; }
}

public class RolUpdateModel
{
    public Guid Id { get; set; }
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }
    public required List<int> PermisosIds { get; set; }
}

public class PermisoModel
{
    public int Id { get; set; }
    public required string Nombre { get; set; }
    public required string Modulo { get; set; }
    public string? Descripcion { get; set; }
}