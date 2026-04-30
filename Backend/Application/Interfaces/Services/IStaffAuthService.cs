using Application.Common;
using Application.DTOs;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    /// <summary>
    /// user regiser,login and auth services
    /// </summary>
    public interface IStaffAuthService
    {
        Task<ViewStaffDto> RegisterStaffAsync(CreateStaffDto dto);
        Task<ViewStaffDto?> UpdateStaffDetailsAsync(UpdateStaffDto dto);
        Task<bool> DeleteStaffAsync(Guid id);
        Task<bool> UpdateStaffRoleAsync(Guid id, string role);
        Task<ViewStaffDto> GetStaffDetailsAsync(Guid id);
        Task<PagedResult<ViewStaffDto>> GetPagedStaffAsync(int pageNumber, int pageSize);
    }
}
