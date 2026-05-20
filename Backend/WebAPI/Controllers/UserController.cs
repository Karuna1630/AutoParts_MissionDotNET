using System.Security.Claims;
using Application.DTOs.User;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace WebAPI.Controllers;

/// <summary>
/// Exposes current user profile endpoints.
/// </summary>
[Authorize]
[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IImageService _imageService;

    public UserController(IUserRepository userRepository, IImageService imageService)
    {
        _userRepository = userRepository;
        _imageService = imageService;
    }

    /// <summary>
    /// Returns the current user's profile.
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();

        decimal creditBalance = 0;
        int vehiclesCount = 0;

        // If customer, get credit balance and vehicles count
        if (user.Role == "Customer")
        {
            var customerRepo = HttpContext.RequestServices.GetService<IGenericRepository<Domain.Entities.Customer>>();
            if (customerRepo != null)
            {
                var customer = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(
                    customerRepo.Query(), c => c.Vehicles).FirstOrDefaultAsync(c => c.UserId == userId);
                if (customer != null)
                {
                    creditBalance = customer.CreditBalance;
                    vehiclesCount = customer.Vehicles.Count;
                }
            }
        }

        return Ok(new
        {
            success = true,
            data = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Phone,
                user.Address,
                user.Role,
                user.AvatarUrl,
                user.CoverUrl,
                creditBalance = creditBalance,
                vehiclesCount = vehiclesCount
            }
        });
    }

    /// <summary>
    /// Updates the current user's profile.
    /// </summary>
    [HttpPost("profile/update")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequestDto request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();

        // 1. Update basic info
        user.FullName = request.FullName;
        user.Phone = request.Phone;
        user.Address = request.Address;
        user.UpdatedAt = DateTime.UtcNow;

        // 2. Handle Avatar upload
        if (request.Avatar != null)
        {
            var avatarUrl = await _imageService.UploadImageAsync(request.Avatar, "avatars");
            if (!string.IsNullOrEmpty(avatarUrl))
            {
                user.AvatarUrl = avatarUrl;
            }
        }

        // 3. Handle Cover upload
        if (request.Cover != null)
        {
            var coverUrl = await _imageService.UploadImageAsync(request.Cover, "covers");
            if (!string.IsNullOrEmpty(coverUrl))
            {
                user.CoverUrl = coverUrl;
            }
        }

        await _userRepository.UpdateAsync(user);

        return Ok(new
        {
            success = true,
            message = "Profile updated successfully",
            data = new
            {
                user.FullName,
                user.Email,
                user.AvatarUrl,
                user.CoverUrl,
                user.Phone,
                user.Address
            }
        });
    }
}
