using Application.DTOs.Notification;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
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

/// <summary>
/// Exposes notification endpoints.
/// </summary>
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

    /// <summary>
    /// Returns the current user's notifications.
    /// </summary>
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

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
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

    /// <summary>
    /// Sends a notification to all admins.
    /// </summary>
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

    /// <summary>
    /// Creates a notification for a specific user.
    /// </summary>
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

    /// <summary>
    /// Triggers a low stock notification check.
    /// </summary>
    [HttpPost("check-low-stock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TriggerLowStockCheck([FromServices] INotificationService notificationService)
    {
        await notificationService.CheckAndNotifyLowStockAsync();
        return Ok(new { success = true, message = "Low stock check completed and notifications sent." });
    }

    /// <summary>
    /// Triggers an overdue credit reminder check.
    /// </summary>
    [HttpPost("check-overdue-credits")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TriggerOverdueCreditsCheck([FromServices] INotificationService notificationService)
    {
        await notificationService.CheckAndSendCreditRemindersAsync();
        return Ok(new { success = true, message = "Overdue credits check completed and reminders sent." });
    }
}
