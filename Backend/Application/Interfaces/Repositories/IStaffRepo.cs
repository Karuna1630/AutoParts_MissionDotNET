using Application.Common;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories
{
    /// <summary>
    /// user repo activities for all roles
    /// </summary>
    public interface IStaffRepo
    {
        Task<UserProfile?> GetByIdAsync(Guid id);
        Task<UserProfile> AddAsync(UserProfile profile);
        Task<UserProfile> UpdateAsync(UserProfile profile);
        Task<bool> UpdateRoleAsync(Guid id, UserRole newRole);
        Task<bool> DeleteAsync(Guid id);
        Task<PagedResult<UserProfile>> GetPagedStaffAsync(int pageNumber, int pageSize, string? search = null);
    }
}
