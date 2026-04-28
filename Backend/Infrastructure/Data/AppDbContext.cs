using Domain.Entities;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class AppDbContext(DbContextOptions options) : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
    {
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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
