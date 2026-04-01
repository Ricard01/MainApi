using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations;

public class RolConfiguration : IEntityTypeConfiguration<Rol>
{
    public void Configure(EntityTypeBuilder<Rol> builder)
    {

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Nombre).IsRequired().HasMaxLength(50);
        builder.Property(r => r.Descripcion).IsRequired().HasMaxLength(200);
        
        builder.HasMany(x => x.Users)
            .WithOne(x => x.Rol)
            .HasForeignKey( x => x.IdRol)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict); // No permite borrar el rol si hay usuarios asignados a este rol. 
        
        builder.HasMany(r => r.PermisosRol)
            .WithOne(rp => rp.Rol)
            .HasForeignKey(rp => rp.IdRol)
            .OnDelete(DeleteBehavior.Cascade); // Cuando se borrar el rol tambien los respectivos permisos que tenia asignado en la tabla PermisosRol 
    }
}
