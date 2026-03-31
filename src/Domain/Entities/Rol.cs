using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;


public class Rol : BaseEntity<Guid>
{
    public required string Nombre { get; init; }
    public required string Descripcion { get; init; }

    private readonly List<User> _users = new();
    public IReadOnlyCollection<User> Users => _users.AsReadOnly();
    
    private readonly List<PermisoRol> _permisosRol = new();
    public IReadOnlyCollection<PermisoRol> PermisosRol => _permisosRol.AsReadOnly();
    
    public void AsignarPermiso(int idPermiso)
    {
        if (!_permisosRol.Any(rp => rp.IdPermiso == idPermiso))
        {
            _permisosRol.Add(new PermisoRol(this.Id, idPermiso));
        }
    }

}
