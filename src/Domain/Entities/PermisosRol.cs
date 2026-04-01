namespace MainApi.Domain.Entities;

public class PermisosRol
{
    public int Id { get; set; }
    public Guid IdRol { get; private set; }
    public Rol Rol { get; private set; } = default!;
    public int IdPermiso { get; set; }
    public Permiso Permiso { get; private set; } = default!;

    private PermisosRol()
    {
    }

    public PermisosRol(Guid idRol, int idPermiso)
    {
        IdRol = idRol;
        IdPermiso = idPermiso;
    }
}