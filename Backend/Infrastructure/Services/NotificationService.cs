using Application.DTOs.Email;
using Application.Interfaces.Services;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Services;

// Managing dashboard notifications and email reminders
public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        AppDbContext context,
        IEmailService emailService,
        IOptions<EmailSettings> emailSettings,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    // Checking parts for low stock and notifying staff
    public async Task CheckAndNotifyLowStockAsync(int? partId = null)
    {
        _logger.LogInformation("Checking for low stock parts...");

        // Only look for parts that are low on stock AND haven't been alerted for in the last 24 hours
        var thresholdDate = DateTime.UtcNow.AddHours(-24);
        var query = _context.Parts.Where(p => p.StockQuantity < 10 && 
            (p.LastLowStockAlertDate == null || p.LastLowStockAlertDate < thresholdDate));

        if (partId.HasValue)
        {
            query = query.Where(p => p.Id == partId.Value);
        }

        var lowStockParts = await query.ToListAsync();

        if (!lowStockParts.Any())
        {
            _logger.LogInformation("No new low stock parts to notify at this time.");
            return;
        }

        foreach (var part in lowStockParts)
        {
            // Update the last alert date so we don't spam again for 24 hours
            part.LastLowStockAlertDate = DateTime.UtcNow;
            
            // Create dashboard notifications for all Admins and Staff
            var usersToNotify = await _context.AppUsers
                .Where(u => u.Role == "Admin" || u.Role == "Staff")
                .ToListAsync();

            foreach (var user in usersToNotify)
            {
                // Extra check: Don't add if there's already an unread "LowStock" alert for this part for this user
                var exists = await _context.Notifications.AnyAsync(n => 
                    n.UserId == user.Id && 
                    n.Type == "LowStock" && 
                    n.RelatedId == part.Id.ToString() && 
                    !n.IsRead);

                if (exists) continue;

                _context.Notifications.Add(new Notification
                {
                    UserId = user.Id,
                    Title = "Low Stock Alert",
                    Message = $"Part {part.Name} ({part.SKU}) is low on stock: {part.StockQuantity} left.",
                    Type = "LowStock",
                    RelatedId = part.Id.ToString(),
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Processed dashboard alerts for {lowStockParts.Count} low stock parts.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save low stock dashboard notifications.");
        }
    }

    /// <summary>
    /// Sends overdue credit reminders to customers.
    /// </summary>
    public async Task CheckAndSendCreditRemindersAsync()
    {
        _logger.LogInformation("Checking for overdue credits...");

        var oneMonthAgo = DateTime.UtcNow.AddDays(-30);
        
        var customersWithOverdueCredit = await _context.Customers
            .Include(c => c.User)
            .Include(c => c.SalesInvoices)
            .Where(c => c.CreditBalance > 0)
            .Where(c => c.LastCreditReminderDate == null || c.LastCreditReminderDate < DateTime.UtcNow.AddDays(-7))
            .ToListAsync();

        foreach (var customer in customersWithOverdueCredit)
        {
            var overdueInvoices = customer.SalesInvoices
                .Where(si => si.PaymentStatus == "Credit" && si.InvoiceDate < oneMonthAgo && (si.FinalAmount - si.AmountPaid) > 0)
                .ToList();

            if (!overdueInvoices.Any()) continue;

            var body = new StringBuilder();
            body.AppendLine($"<h3>Dear {customer.User.FullName},</h3>");
            body.AppendLine("<p>This is a friendly reminder that you have outstanding credit balances older than 30 days. Please settle these amounts at your earliest convenience.</p>");
            body.AppendLine("<table border='1' cellpadding='8' style='border-collapse: collapse; width: 100%;'>");
            body.AppendLine("<tr style='background-color: #f2f2f2;'><th>Invoice #</th><th>Date</th><th>Due Amount</th></tr>");

            decimal totalDue = 0;
            foreach (var inv in overdueInvoices)
            {
                var due = inv.FinalAmount - inv.AmountPaid;
                body.AppendLine($"<tr><td>{inv.InvoiceNumber}</td><td>{inv.InvoiceDate:MMM dd, yyyy}</td><td>Rs. {due:N2}</td></tr>");
                totalDue += due;
            }
            body.AppendLine($"<tr style='font-weight: bold; background-color: #f9f9f9;'><td colspan='2'>Total Overdue</td><td>Rs. {totalDue:N2}</td></tr>");
            body.AppendLine("</table>");
            body.AppendLine("<p>Please visit our store to make a payment. Thank you!</p>");

            try
            {
                await _emailService.SendEmailAsync(customer.User.Email, "Overdue Credit Reminder – Action Required", body.ToString());
                customer.LastCreditReminderDate = DateTime.UtcNow;
                _logger.LogInformation($"Sent overdue reminder to {customer.User.Email}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send credit reminder to {customer.User.Email}.");
            }
        }

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Creates a notification for a specific user.
    /// </summary>
    public async Task CreateDashboardNotificationAsync(int userId, string title, string message, string type = "Info", string? relatedId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            RelatedId = relatedId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}
