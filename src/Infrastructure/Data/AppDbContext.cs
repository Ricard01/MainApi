using System.Reflection;
using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MainApi.Infrastructure.Data;


public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAppDbContext
{

    public DbSet<User> Usuarios => Set<User>();
    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<PermisosRol> PermisosRol  => Set<PermisosRol>();
    public DbSet<Permiso> Permisos  => Set<Permiso>();
    public DbSet<Empresa> Empresa => Set<Empresa>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly() );
    }
}
