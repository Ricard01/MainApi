using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;

public class PermisoRol : BaseEntity<Guid>
{
    public Guid IdRol { get; private set; }
    public Rol Rol { get; private set; } = default!;
    public int IdPermiso { get; set; }
    public Permiso Permiso { get; private set; } = default!;
    
    private PermisoRol() { } 

    public PermisoRol(Guid idRol, int idPermiso)
    {
        IdRol = idRol;
        IdPermiso = idPermiso;
    }
}
