using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MainApi.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserName).IsUnique();
        builder.Property(x => x.UserName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ApellidoPaterno).HasMaxLength(100);
        builder.Property(x => x.ApellidoMaterno).HasMaxLength(100);
        builder.HasIndex(x => x.Email).IsUnique();
        builder.Property(x => x.Email).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Telefono).HasMaxLength(20);
        builder.Property(x => x.ImagenPerfilUrl).HasDefaultValue("../../../assets/imgs/user-placeholder.png");
        builder.Property(x => x.PasswordHash).IsRequired();
        builder.Property(x => x.IdRol).IsRequired();

        builder.HasOne(x => x.Rol)
            .WithMany(r => r.Users)
            .HasForeignKey(x => x.IdRol)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}