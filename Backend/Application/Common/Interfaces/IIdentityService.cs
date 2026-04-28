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

    }
}
