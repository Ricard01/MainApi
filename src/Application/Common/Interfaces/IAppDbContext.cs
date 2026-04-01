using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MainApi.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Usuarios { get; }
    
    DbSet<Rol> Roles { get; }
    
    DbSet<PermisosRol> PermisosRol  { get; }
    
    DbSet<Permiso> Permisos { get; }
    
    DbSet<Empresa> Empresa { get; }
    
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
