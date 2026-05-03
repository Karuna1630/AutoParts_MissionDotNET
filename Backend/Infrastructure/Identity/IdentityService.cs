using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Identity
{
    public class IdentityService(UserManager<ApplicationUser> userManager) : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager = userManager;

        public async Task<(string email, string phoneNumber)> FindByIdAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return (string.Empty, string.Empty);
            return (user.Email ?? string.Empty, user.PhoneNumber ?? string.Empty);
        }

       public async Task<bool> VerifyPassword(string id, string password)
        {
            var user = await _userManager.FindByIdAsync(id) ?? throw new NotFoundException("user email not found");
            return await _userManager.CheckPasswordAsync(user, password);
         
        }

        public async Task<(string id, string email, string phoneNumber)> FindByEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return (user == null) ? (string.Empty, string.Empty, string.Empty) : (user.Id.ToString(), user.Email ?? string.Empty, user.PhoneNumber ?? string.Empty);

        }

        /// <summary>
        /// creating an identity profile
        /// </summary>
        /// <param name="email"></param>
        /// <param name="phoneNumber"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public async Task<(bool Succeeded, Guid id)> CreateUserAsync(string email, string phoneNumber, string password)
        {
            try
            {
                var user = new ApplicationUser 
                { 
                    UserName = email,
                    Email = email, 
                    PhoneNumber = phoneNumber 
                };
                
                var result = await _userManager.CreateAsync(user, password);
                
                return (result.Succeeded, user.Id);
            }
            catch (Exception ex)
            {
                // Preserve the original exception details
                throw new InvalidOperationException("An error occurred while creating the user.", ex);
            }
        }

        /// <summary>
        /// update identity details if not null
        /// </summary>
        /// <param name="id"></param>
        /// <param name="email"></param>
        /// <param name="phoneNumber"></param>
        /// <returns></returns>
        public async Task<bool> UpdateUserAsync(string id, string? email, string? phoneNumber)
        {
            try
            {
                var identity = await _userManager.FindByIdAsync(id);
                if (identity == null) return false;
                identity.Email = !string.IsNullOrWhiteSpace(email) ? email : identity.Email;
                identity.PhoneNumber = !string.IsNullOrWhiteSpace(phoneNumber) ? phoneNumber : identity.PhoneNumber;
                var result = await _userManager.UpdateAsync(identity);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return false;
            }
        }

        /// <summary>
        /// Add role to identity user
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="role"></param>
        /// <returns></returns>
        public async Task<bool> AddToRoleAsync(Guid userId, string role)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;
            var result = await _userManager.AddToRoleAsync(user, role.ToUpper());
            return result.Succeeded;
        }

        /// <summary>
        /// update role of existing user
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="oldRole"></param>
        /// <param name="newRole"></param>
        /// <returns></returns>
        public async Task<bool> UpdateRoleAsync(Guid userId, string oldRole, string newRole)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return false;
            try
            {
                await _userManager.RemoveFromRoleAsync(user, oldRole.ToUpper());
                var result = await _userManager.AddToRoleAsync(user, newRole.ToUpper());
                return result.Succeeded;
            }
            catch (Exception) 
            {
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var result = await _userManager.Users.Where(u => u.Id == userId).ExecuteDeleteAsync();
            return result > 0;
        }

    }
}
