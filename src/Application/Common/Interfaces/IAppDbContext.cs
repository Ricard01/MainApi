using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MainApi.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Usuarios { get; }
    
    DbSet<Rol> Roles { get; }
    
    DbSet<PermisoRol> RolPermisos  { get; }
    
    DbSet<Permiso> Permisos { get; }
    
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
