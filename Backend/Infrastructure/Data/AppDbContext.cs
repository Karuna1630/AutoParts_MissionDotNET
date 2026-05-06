using Domain.Entities;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<User> AppUsers => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<PartRequest> PartRequests { get; set; }
    public DbSet<ServiceAppointment> ServiceAppointments { get; set; }
    public DbSet<ServiceReview> ServiceReviews { get; set; }
    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<SalesInvoiceItem> SalesInvoiceItems => Set<SalesInvoiceItem>();
    public DbSet<OrderRequest> OrderRequests => Set<OrderRequest>();
    public DbSet<OrderRequestItem> OrderRequestItems => Set<OrderRequestItem>();

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

            entity.HasOne<ApplicationUser>()
                .WithOne()
                .HasForeignKey<UserProfile>(x => x.IdentityId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
