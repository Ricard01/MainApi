using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;


public class Rol : BaseEntity<Guid>
{
    public required string Nombre { get; init; }
    public required string Descripcion { get; init; }

    private readonly List<User> _users = new();
    public IReadOnlyCollection<User> Users => _users.AsReadOnly();
    
    private readonly List<RolPermiso> _rolPermisos = new();
    public IReadOnlyCollection<RolPermiso> RolPermisos => _rolPermisos.AsReadOnly();
    
    public void AsignarPermiso(int idPermiso)
    {
        if (!_rolPermisos.Any(rp => rp.IdPermiso == idPermiso))
        {
            _rolPermisos.Add(new RolPermiso(this.Id, idPermiso));
        }
    }

}
