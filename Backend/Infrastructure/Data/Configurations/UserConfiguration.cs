using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasIndex(x => x.Email)
            .IsUnique();

        builder.Property(x => x.Role)
            .HasMaxLength(20);
            
        builder.Property(x => x.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(x => x.CoverUrl)
            .HasMaxLength(500);

        builder.Property(x => x.Address)
            .HasMaxLength(250);
    }
}
