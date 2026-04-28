using Application.Interfaces.Repositories;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Authorize(Roles = UserRoles.Admin)]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public AdminController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats(CancellationToken cancellationToken)
    {
        var totalUsers = await _userRepository.CountAllAsync(cancellationToken);
        var totalCustomers = await _userRepository.CountByRoleAsync(UserRoles.Customer, cancellationToken);
        var totalStaff = await _userRepository.CountByRoleAsync(UserRoles.Staff, cancellationToken);
        var totalAdmins = await _userRepository.CountByRoleAsync(UserRoles.Admin, cancellationToken);

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers,
                totalCustomers,
                totalStaff,
                totalAdmins
            }
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] string? role, CancellationToken cancellationToken)
    {
        var users = string.IsNullOrWhiteSpace(role)
            ? await _userRepository.GetAllAsync(cancellationToken)
            : await _userRepository.GetByRoleAsync(role, cancellationToken);

        var result = users.Select(u => new
        {
            u.Id,
            u.FullName,
            u.Email,
            u.Phone,
            u.Role,
            u.IsActive,
            u.AvatarUrl,
            u.Address,
            u.CreatedAt,
            u.UpdatedAt
        });

        return Ok(new { success = true, data = result });
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUserById(int id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null) return NotFound(new { success = false, message = "User not found." });

        return Ok(new
        {
            success = true,
            data = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Phone,
                user.Role,
                user.IsActive,
                user.AvatarUrl,
                user.CoverUrl,
                user.Address,
                user.CreatedAt,
                user.UpdatedAt
            }
        });
    }

    [HttpPut("users/{id:int}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(int id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null) return NotFound(new { success = false, message = "User not found." });

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return Ok(new
        {
            success = true,
            message = user.IsActive ? "User activated." : "User deactivated.",
            data = new { user.Id, user.IsActive }
        });
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (user == null) return NotFound(new { success = false, message = "User not found." });

        if (user.Role == UserRoles.Admin)
            return BadRequest(new { success = false, message = "Cannot delete admin accounts." });

        await _userRepository.DeleteAsync(user, cancellationToken);

        return Ok(new { success = true, message = "User deleted successfully." });
    }
}
