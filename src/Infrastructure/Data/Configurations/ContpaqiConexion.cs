using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations; 

public class ContpaqiConexionConfiguration : IEntityTypeConfiguration<ContpaqiConexion>
{
    public void Configure(EntityTypeBuilder<ContpaqiConexion> builder)
    {
        builder.ToTable("ContpaqiConexiones"); 
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Servidor).IsRequired().HasMaxLength(100); 
        builder.Property(x => x.BaseDatos).IsRequired().HasMaxLength(100);
        builder.Property(x => x.SqlUser).IsRequired().HasMaxLength(100);
        builder.Property(x => x.PasswordEncrypted).HasMaxLength(500).IsRequired(); 
        builder.Property(x => x.Puerto).IsRequired().HasDefaultValue(1433);
    }
}