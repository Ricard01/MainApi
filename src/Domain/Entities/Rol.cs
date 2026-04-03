using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;


public class Rol : BaseEntity<Guid>
{
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }

    private readonly List<User> _users = new();
    public IReadOnlyCollection<User> Users => _users.AsReadOnly();
    
    private readonly List<PermisosRol> _permisosRol = new();
    public IReadOnlyCollection<PermisosRol> PermisosRol => _permisosRol.AsReadOnly();
    
    public void AsignarPermiso(int idPermiso)
    {
        if (!_permisosRol.Any(rp => rp.IdPermiso == idPermiso))
        {
            _permisosRol.Add(new PermisosRol(this.Id, idPermiso));
        }
    }

}
