using Application.Common;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Mappers;
using Application.DTOs;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class StaffAuthService(IUserRepo repo, IIdentityService identityService) : IStaffAuthService
    {
        private readonly IUserRepo _repo = repo;
        private readonly IIdentityService _identityService = identityService;
        public async Task<ViewStaffDto> RegisterStaffAsync(CreateStaffDto dto)
        {
            //making identity & assigning role
  
            var (Succeeded, id) = await _identityService.CreateUserAsync(dto.Email, dto.PhoneNumber, dto.Password);
            if (!Succeeded) throw new InvalidOperationException("Identity creation failed.");
            try { 
            // add role
                await _identityService.AddToRoleAsync(id, dto.UserRole.ToString());

                //mapping remainaing dto props to userprofile object
                var profile = new UserProfile
                {
                    IdentityId = id,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    ProfilePictureUrl = dto.ProfilePictureUrl,
                    UserRole = dto.UserRole,
                    RegistrationDate = DateTime.UtcNow
                };

                // saving to db
                await _repo.AddAsync(profile);

                // returning viewdto
                return StaffMapper.ToViewDto(profile, dto.Email, dto.PhoneNumber);
            }
            catch (Exception)
            {
                // Rollback: Delete the identity user so the system isn't in a broken state
                await _identityService.DeleteUserAsync(id);
                throw new InvalidOperationException("Profile creation failed. Registration rolled back.");
            }

        }
        public async Task<ViewStaffDto?> UpdateStaffDetailsAsync(UpdateStaffDto dto)
        {
            // update identity
            var (email, phoneNumber) = await _identityService.FindByIdAsync(dto.IdentityId);

            // update profile
            if (email != null)
            {
                var profile = await _repo.GetByIdAsync(Guid.Parse(dto.IdentityId));

                if (profile != null)
                {
                    profile.FirstName = dto.FirstName;
                    profile.LastName = dto.LastName;
                    profile.ProfilePictureUrl = dto.ProfilePictureUrl;
                    var updatedProfile = await _repo.UpdateAsync(profile);
                    return StaffMapper.ToViewDto(updatedProfile, email, phoneNumber);
                }
                throw new InvalidOperationException("identity without profile data?");
            }
            else return null;
        }
        public async Task<bool> DeleteStaffAsync(Guid id)
        {
            var profile = await _repo.GetByIdAsync(id) ?? throw new NotFoundException("Staff id not found.");
            if (!await _repo.DeleteAsync(id)) throw new DBConcurrencyException("Faild to delete user");
            if (!await _identityService.DeleteUserAsync(id)) throw new DBConcurrencyException("Faild to delete user");    
            return true;
        }
        public async Task<bool> UpdateStaffRoleAsync(Guid id, string role)
        {
            if (role.ToUpper() != "ADMIN" && role.ToUpper() != "STAFF") throw new InvalidOperationException("Not a valid role");
            var userRole = (role.ToUpper() == UserRole.ADMIN.ToString()) ? UserRole.ADMIN : UserRole.STAFF;
            if (!await _repo.UpdateRoleAsync(id, userRole)) throw new DBConcurrencyException("Cannot update role");
            return true;
        }

        public async Task<ViewStaffDto> GetStaffDetailsAsync(Guid id)
        {
            // 1. Fetch from Domain Repository
            var profile = await _repo.GetByIdAsync(id);
            if (profile == null) throw new NotFoundException("Profile not found");

            // 2. Fetch from Identity 
            var (email, phoneNumber) = await _identityService.FindByIdAsync(profile.IdentityId.ToString());
            if (email == null) throw new NotFoundException("Auth account missing");

            //return view
            return StaffMapper.ToViewDto(profile, email, phoneNumber);
                     
        }

        public async Task<PagedResult<ViewStaffDto>> GetPagedStaffAsync(int pageNumber, int pageSize)
        {
            var pagedResult = await _repo.GetPagedStaffAsync(pageNumber, pageSize);

            // get identity info & convert items  to dto
            List<ViewStaffDto> items = [];
            foreach (var p in pagedResult.Items)
            {
                var (email, phoneNumber) = await _identityService.FindByIdAsync(p.IdentityId.ToString());
                var fullProfile = StaffMapper.ToViewDto(p, email, phoneNumber);
                items.Add(fullProfile);
            }
            // results shows dto version
            return new PagedResult<ViewStaffDto>
            {
                Items = items,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
            
        }
    }
}
