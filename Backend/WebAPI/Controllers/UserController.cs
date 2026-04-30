using System.Security.Claims;
using Application.DTOs.User;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

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

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        if (userId == 0) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return NotFound();

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
                user.CoverUrl
            }
        });
    }

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

    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Staff}")]
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers(CancellationToken cancellationToken)
    {
        var customers = await _userRepository.GetByRoleAsync(UserRoles.Customer, cancellationToken);
        var result = customers.Select(c => new
        {
            c.Id,
            c.FullName,
            c.Email,
            c.Phone,
            c.Address,
            c.IsActive
        });

        return Ok(new { success = true, data = result });
    }
}
