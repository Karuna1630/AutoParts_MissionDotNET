using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");

        builder.HasKey(v => v.Id);

        // VehicleNumber must be unique per customer
        builder.HasIndex(v => new { v.CustomerId, v.VehicleNumber })
            .IsUnique();

        builder.Property(v => v.VehicleNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(v => v.VehicleModel)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(v => v.VehicleMake)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(v => v.VehicleColor)
            .HasMaxLength(30);

        // Range validation is handled at entity level with [Range], 
        // but can also be enforced in DB via check constraints if needed.
        
        builder.HasOne(v => v.Customer)
            .WithMany(u => u.Vehicles)
            .HasForeignKey(v => v.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
