using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations;

public class PermisoConfiguration : IEntityTypeConfiguration<Permiso>
{
    public void Configure(EntityTypeBuilder<Permiso> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Nombre).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Modulo).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Descripcion).HasMaxLength(200);
        builder.HasIndex(p => p.Nombre).IsUnique(); // Índice único para evitar duplicados a nivel de base de datos
    }
}
