using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data;

public class AppDbContext : DbContext
{
    public class AppDbContext(DbContextOptions options) : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
    {
        public DbSet<UserProfile> UserProfiles { get; set; }
   public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
     modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
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
        }

       
    }
}
