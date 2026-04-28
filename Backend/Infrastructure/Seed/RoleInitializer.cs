using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Seed
{
    public static class DbInitializer
    {
        public static async Task SeedRolesAsync(IServiceProvider services)
        {
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

            string[] roleNames = { "Admin", "Staff", "Customer" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    // Create the roles and seed them to the database
                    await roleManager.CreateAsync(new IdentityRole<Guid>
                    {
                        Name = roleName,
                        NormalizedName = roleName.ToUpper() // Critical for Identity lookups
                    });
                }
            }
        }
    }
}
