using System.Reflection;
using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MainApi.Infrastructure.Data;


public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{

    public DbSet<User> Usuarios => Set<User>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<PermisoRol> RolPermisos  => Set<PermisoRol>();
    public DbSet<Permiso> Permisos  => Set<Permiso>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly() );
    }
}
