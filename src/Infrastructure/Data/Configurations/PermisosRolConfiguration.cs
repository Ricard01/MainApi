using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations;

public class PermisosRolConfiguration : IEntityTypeConfiguration<PermisosRol>
{
    public void Configure(EntityTypeBuilder<PermisosRol> builder)
    {
        builder.ToTable("PermisosRol");
        builder.HasKey(rp => rp.Id); 
        builder.Property(rp => rp.IdRol).IsRequired();
        builder.Property(rp => rp.IdPermiso).IsRequired();

        // Evita duplicados del mismo permiso en el mismo rol
        builder.HasIndex(rp => new { rp.IdRol, rp.IdPermiso })
            .IsUnique();
        
        builder.HasOne(rp => rp.Rol)
            .WithMany(r => r.PermisosRol)
            .HasForeignKey(rp => rp.IdRol); 

        builder.HasOne(rp => rp.Permiso)
            .WithMany() 
            .HasForeignKey(rp => rp.IdPermiso) 
            .OnDelete(DeleteBehavior.Restrict);
    }
}
