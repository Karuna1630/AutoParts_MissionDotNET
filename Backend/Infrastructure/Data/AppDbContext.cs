using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<UserProfile> UserProfiles { get; set; }
    public new DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        builder.Entity<UserProfile>(entity =>
        {
            entity.ToTable("UserProfiles"); 
            entity.HasKey(x => x.IdentityId);    

            entity.Property(x => x.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            // Setup the Relationship to IdentityUser
            entity.HasOne<ApplicationUser>()
                .WithOne()
                .HasForeignKey<UserProfile>(x => x.IdentityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Ensure Domain.Entities.User is mapped correctly if not handled by configurations
        builder.Entity<User>(entity => {
            entity.HasIndex(u => u.Email).IsUnique();
        });
    }
}
