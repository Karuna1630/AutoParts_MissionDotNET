using Application.Interfaces.Security;
using Domain.Constants;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Seed;

public static class AdminSeeder
{
    public static async Task SeedAdminAsync(
        IServiceProvider services,
        IConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        var seedEmail = configuration["ADMIN_EMAIL"] ?? configuration["AdminSeed:Email"];
        var seedPassword = configuration["ADMIN_PASSWORD"] ?? configuration["AdminSeed:Password"];
        var seedFullName = configuration["AdminSeed:FullName"] ?? "System Admin";
        var seedPhone = configuration["AdminSeed:Phone"] ?? "+10000000000";

        if (string.IsNullOrWhiteSpace(seedEmail) || string.IsNullOrWhiteSpace(seedPassword))
        {
            return;
        }

        await using var scope = services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var normalizedEmail = seedEmail.Trim().ToLowerInvariant();
        var adminExists = await dbContext.AppUsers.AnyAsync(x => x.Email == normalizedEmail, cancellationToken);
        if (adminExists)
        {
            return;
        }

        dbContext.AppUsers.Add(new User
        {
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(seedPassword),
            FullName = seedFullName,
            Phone = seedPhone,
            Role = UserRoles.Admin,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
