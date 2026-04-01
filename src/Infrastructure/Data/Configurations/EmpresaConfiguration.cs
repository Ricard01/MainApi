using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations;

public class EmpresaConfiguration : IEntityTypeConfiguration<Empresa>
{
    public void Configure(EntityTypeBuilder<Empresa> builder)
    {
        builder.ToTable("Empresa");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Rfc).HasMaxLength(13);
        builder.Property(e => e.Estado).HasMaxLength(50);
        builder.Property(e => e.Ciudad).HasMaxLength(50);
        builder.Property(e => e.Municipio).HasMaxLength(50);
        builder.Property(e => e.Domicilio).HasMaxLength(200);
        builder.Property(e => e.CodigoPostal).HasMaxLength(10);
        builder.Property(e => e.RazonSocial).HasMaxLength(200);
        builder.Property(e => e.Telefono).HasMaxLength(20);
        builder.Property(e => e.Email).HasMaxLength(200);
        builder.Property(e => e.LogoUrl).HasDefaultValue("../../../assets/imgs/logo.png");
    }
}