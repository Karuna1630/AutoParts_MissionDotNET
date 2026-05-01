using Application.Common;
using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Mappers;
using Application.DTOs;
using Application.DTOs.Auth;
using Application.DTOs.Common;
using Application.Interfaces.Repositories;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Services
{
    public class StaffAuthService(IStaffRepo repo, IIdentityService identityService, ITokenService tokenService, IImageService imageService) : IStaffAuthService
    {
        private readonly IStaffRepo _repo = repo;
        private readonly IIdentityService _identityService = identityService;
        private readonly ITokenService _tokenService = tokenService;
        private readonly IImageService _imageService = imageService;
        public async Task<ViewStaffDto> RegisterStaffAsync(CreateStaffDto dto, Guid? managedById = null)
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
                    RegistrationDate = DateTime.UtcNow,
                    LastManagedBy = managedById ?? Guid.Empty,
                    LastManagedDate = managedById.HasValue ? DateTime.UtcNow : default
                };

                // saving to db
                await _repo.AddAsync(profile);

                // returning viewdto
                var managedByName = await ResolveManagedByNameAsync(profile.LastManagedBy);
                return StaffMapper.ToViewDto(profile, dto.Email, dto.PhoneNumber, managedByName);
            }
            catch (Exception)
            {
                // Rollback: Delete the identity user so the system isn't in a broken state
                await _identityService.DeleteUserAsync(id);
                throw new InvalidOperationException("Profile creation failed. Registration rolled back.");
            }

        }

        public async Task<ApiResponse<AuthResponseDto>> StaffLoginAsync(LoginRequestDto request) 
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return new ApiResponse<AuthResponseDto> { Message = "Email and password are required.", Success = false };
            }

            var (id, email, phoneNumber) = await _identityService.FindByEmailAsync(request.Email);
            if (id is null || (await _identityService.VerifyPassword(id, request.Password) == false))
            {
                return new ApiResponse<AuthResponseDto> { Message = "Invalid Email or password" , Success = false };
            }
            var userProfile = await _repo.GetByIdAsync(Guid.Parse(id));

            var profile = StaffMapper.ToViewDto(userProfile, email, phoneNumber);

            //form the jwt token
            var staffData = BuildStaffAuthResponse(profile);

            return new ApiResponse<AuthResponseDto> { Message = "Login Success.", Success = true, Data = staffData };


        }
        public async Task<ViewStaffDto?> UpdateStaffDetailsAsync(UpdateStaffDto dto, Guid? managedById = null)
        {
            // update identity
            var (email, phoneNumber) = await _identityService.FindByIdAsync(dto.IdentityId);

            // update profile
            if (!string.IsNullOrWhiteSpace(email) || !string.IsNullOrWhiteSpace(phoneNumber))
            {
                if (!await _identityService.UpdateUserAsync(dto.IdentityId, dto.Email, dto.PhoneNumber))
                {
                    throw new InvalidOperationException("Failed to update identity details.");
                }

                var profile = await _repo.GetByIdAsync(Guid.Parse(dto.IdentityId));

                if (profile != null)
                {
                    profile.FirstName = dto.FirstName;
                    profile.LastName = dto.LastName;
                    profile.ProfilePictureUrl = dto.ProfilePictureUrl;
                    if (managedById.HasValue)
                    {
                        profile.LastManagedBy = managedById.Value;
                        profile.LastManagedDate = DateTime.UtcNow;
                    }
                    var updatedProfile = await _repo.UpdateAsync(profile);
                    var managedByName = await ResolveManagedByNameAsync(updatedProfile.LastManagedBy);
                    return StaffMapper.ToViewDto(updatedProfile, dto.Email, dto.PhoneNumber, managedByName);
                }
                throw new InvalidOperationException("Identity without profile data.");
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
            if (!Enum.TryParse<UserRole>(role, true, out var userRole) || userRole is UserRole.Customer)
            {
                throw new InvalidOperationException("Not a valid role");
            }
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
            var managedByName = await ResolveManagedByNameAsync(profile.LastManagedBy);
            return StaffMapper.ToViewDto(profile, email, phoneNumber, managedByName);
                     
        }

        public async Task<PagedResult<ViewStaffDto>> GetPagedStaffAsync(int pageNumber, int pageSize, string? search = null)
        {
            var pagedResult = await _repo.GetPagedStaffAsync(pageNumber, pageSize, search);

            // get identity info & convert items  to dto
            List<ViewStaffDto> items = [];
            foreach (var p in pagedResult.Items)
            {
                var (email, phoneNumber) = await _identityService.FindByIdAsync(p.IdentityId.ToString());
                var managedByName = await ResolveManagedByNameAsync(p.LastManagedBy);
                var fullProfile = StaffMapper.ToViewDto(p, email, phoneNumber, managedByName);
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

        private AuthResponseDto BuildStaffAuthResponse(ViewStaffDto user)
        {
            var (token, expiresAtUtc) =  _tokenService.GenerateStaffToken(user);
            return new AuthResponseDto
            {
                StaffId = user.IdentityId.ToString(),
                Email = user.Email,
                FullName = user.DisplayName,
                Role = user.UserRole.ToString(),
                Token = token,
                AvatarUrl = user.ProfilePictureUrl,
                CoverUrl = "",
                ExpiresAtUtc = expiresAtUtc
            };
        public async Task<ViewStaffDto?> UpdateStaffProfileImageAsync(Guid staffId, IFormFile image, Guid? managedById = null)
        {
            if (image == null || image.Length == 0)
            {
                throw new InvalidOperationException("Profile image is required.");
            }

            var profile = await _repo.GetByIdAsync(staffId);
            if (profile == null)
            {
                throw new NotFoundException("Staff profile not found.");
            }

            var imageUrl = await _imageService.UploadImageAsync(image, "staff");
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                throw new InvalidOperationException("Failed to upload profile image.");
            }

            profile.ProfilePictureUrl = imageUrl;
            if (managedById.HasValue)
            {
                profile.LastManagedBy = managedById.Value;
                profile.LastManagedDate = DateTime.UtcNow;
            }

            var updatedProfile = await _repo.UpdateAsync(profile);
            var (email, phoneNumber) = await _identityService.FindByIdAsync(updatedProfile.IdentityId.ToString());
            var managedByName = await ResolveManagedByNameAsync(updatedProfile.LastManagedBy);
            return StaffMapper.ToViewDto(updatedProfile, email, phoneNumber, managedByName);
        }

        private async Task<string?> ResolveManagedByNameAsync(Guid lastManagedBy)
        {
            if (lastManagedBy == Guid.Empty)
            {
                return null;
            }

            var managerProfile = await _repo.GetByIdAsync(lastManagedBy);
            return managerProfile?.DisplayName;
        }
    }
}

