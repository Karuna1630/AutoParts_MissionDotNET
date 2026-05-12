using Application.DTOs.Notification;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly IGenericRepository<Notification> _notificationRepo;
    private readonly IGenericRepository<User> _userRepo;

    public NotificationsController(
        IGenericRepository<Notification> notificationRepo,
        IGenericRepository<User> userRepo)
    {
        _notificationRepo = notificationRepo;
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var notifications = await _notificationRepo.Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new ViewNotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                RelatedId = n.RelatedId,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = notifications });
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null || notification.UserId != userId) 
            return NotFound();

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _notificationRepo.SaveChangesAsync();

        return Ok(new { success = true });
    }

    [HttpPost("notify-admins")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> NotifyAdmins([FromBody] CreateNotificationDto dto)
    {
        var admins = await _userRepo.Query()
            .Where(u => u.Role == "Admin")
            .ToListAsync();

        foreach (var admin in admins)
        {
            var notification = new Notification
            {
                UserId = admin.Id,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                RelatedId = dto.RelatedId,
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepo.AddAsync(notification);
        }

        await _notificationRepo.SaveChangesAsync();
        return Ok(new { success = true, message = "Admins notified." });
    }

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            RelatedId = dto.RelatedId,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
