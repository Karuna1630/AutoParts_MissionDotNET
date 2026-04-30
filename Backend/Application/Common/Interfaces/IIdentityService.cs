using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Common.Interfaces
{
    public interface IIdentityService
    {
        Task<(string email, string phoneNumber)> FindByIdAsync(string id);
        Task<(bool Succeeded, Guid id)> CreateUserAsync(string email, string phoneNumber, string password);
        Task<bool> UpdateUserAsync(string id, string? email, string? phoneNumber);
        Task<bool> AddToRoleAsync(Guid userId, string role);
        Task<bool> UpdateRoleAsync(Guid userId, string oldRole, string newRole);
        Task<bool> DeleteUserAsync(Guid userId);

        /// <summary>
        /// Verifies a plain-text password against the Identity store for the given email.
        /// Uses UserManager internally — do NOT use Pbkdf2PasswordHasher here.
        /// </summary>
        Task<bool> CheckPasswordAsync(string email, string password);

        /// <summary>
        /// Looks up an Identity user by email and returns their Guid and primary role.
        /// Returns (false, Guid.Empty, "") if the email is not found in the Identity store.
        /// </summary>
        Task<(bool Found, Guid IdentityId, string Role)> FindByEmailAsync(string email);
    }
}
