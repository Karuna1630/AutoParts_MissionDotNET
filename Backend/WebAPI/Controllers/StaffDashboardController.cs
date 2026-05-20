using Application.Common;
using Application.Interfaces.Repositories;
using Domain.Constants;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

/// <summary>
/// Exposes staff dashboard statistics.
/// </summary>
[Authorize(Roles = "Staff,Admin")]
[ApiController]
[Route("api/staff/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns dashboard statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var today = DateTime.UtcNow.Date;

        // 1. Sales Today
        var salesToday = await _context.SalesInvoices
            .Where(i => i.InvoiceDate.Date == today)
            .SumAsync(i => i.FinalAmount);

        var invoicesTodayCount = await _context.SalesInvoices
            .CountAsync(i => i.InvoiceDate.Date == today);

        // 2. Total Customers
        var totalCustomers = await _context.Customers.CountAsync();

        // 3. Low Stock Items
        var lowStockCount = await _context.Parts.CountAsync(p => p.StockQuantity > 0 && p.StockQuantity < 10);

        // 4. Today's Service Appointments
        var appointmentsToday = await _context.ServiceAppointments
            .CountAsync(a => a.PreferredDate.Date == today);

        // 5. Pending Part Requests
        var pendingRequests = 0;
        try {
            pendingRequests = await _context.PartRequests.CountAsync(r => r.Status == "Pending");
        } catch { }

        // 5. Recent Transactions
        var recentSales = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(5)
            .Select(s => new {
                Id = s.Id,
                CustomerName = s.Customer.User.FullName,
                Amount = s.FinalAmount,
                Date = s.InvoiceDate,
                Status = s.PaymentStatus
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                salesToday,
                invoicesTodayCount,
                totalCustomers,
                lowStockCount,
                pendingRequests,
                appointmentsToday,
                recentSales
            }
        });
    }
}
