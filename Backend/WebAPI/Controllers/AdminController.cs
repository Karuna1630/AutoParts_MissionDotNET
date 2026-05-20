using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.DTOs.Report;
using Application.Common;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

/// <summary>
/// Exposes admin reporting and user management endpoints.
/// </summary>
[Authorize(Roles = UserRoles.Admin)]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly Infrastructure.Data.AppDbContext _context;
    private readonly IReportService _reportService;
    private readonly IPdfReportService _pdfReportService;

    public AdminController(
        IUserRepository userRepository, 
        Infrastructure.Data.AppDbContext context,
        IReportService reportService,
        IPdfReportService pdfReportService)
    {
        _userRepository = userRepository;
        _context = context;
        _reportService = reportService;
        _pdfReportService = pdfReportService;
    }

    /// <summary>
    /// Returns the daily financial report.
    /// </summary>
    [HttpGet("reports/daily")]
    public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var result = await _reportService.GenerateDailyReportAsync(targetDate);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns the monthly financial report.
    /// </summary>
    [HttpGet("reports/monthly")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var targetMonth = month ?? DateTime.UtcNow.Month;
        var result = await _reportService.GenerateMonthlyReportAsync(targetYear, targetMonth);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns the yearly financial report.
    /// </summary>
    [HttpGet("reports/yearly")]
    public async Task<IActionResult> GetYearlyReport([FromQuery] int? year)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var result = await _reportService.GenerateYearlyReportAsync(targetYear);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns a report for a date range.
    /// </summary>
    [HttpGet("reports/range")]
    public async Task<IActionResult> GetRangeReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        if (fromDate > toDate) return BadRequest(new { success = false, message = "From date cannot be after To date." });
        
        var result = await _reportService.GenerateRangeReportAsync(fromDate, toDate);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Exports a financial report as PDF.
    /// </summary>
    [HttpGet("reports/export-pdf")]
    public async Task<IActionResult> GetPdfReport([FromQuery] string type, [FromQuery] DateTime? date, [FromQuery] int? year, [FromQuery] int? month)
    {
        OperationResult<FinancialReportDto> result;
        string title = $"{type} Financial Report";

        if (type == "Daily" && date.HasValue)
        {
            result = await _reportService.GenerateDailyReportAsync(date.Value);
            title += $" - {date.Value:yyyy-MM-dd}";
        }
        else if (type == "Monthly" && year.HasValue && month.HasValue)
        {
            result = await _reportService.GenerateMonthlyReportAsync(year.Value, month.Value);
            title += $" - {year.Value}-{month.Value:D2}";
        }
        else if (type == "Yearly" && year.HasValue)
        {
            result = await _reportService.GenerateYearlyReportAsync(year.Value);
            title += $" - {year.Value}";
        }
        else
        {
            return BadRequest(new { success = false, message = "Invalid report parameters." });
        }

        if (!result.Success || result.Data == null)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        var pdfBytes = _pdfReportService.GenerateFinancialReportPdf(result.Data, title);
        string fileName = $"FinancialReport_{type}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
        
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>
    /// Returns dashboard summary metrics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        // 1. User Stats
        var totalUsers = await _userRepository.CountAllAsync(default);
        var totalCustomers = await _userRepository.CountByRoleAsync(UserRoles.Customer, default);
        var totalStaff = await _userRepository.CountByRoleAsync(UserRoles.Staff, default);
        
        // 2. Financial Stats (Total)
        var totalRevenue = await _context.SalesInvoices.SumAsync(i => i.FinalAmount);
        var invoiceCount = await _context.SalesInvoices.CountAsync();

        // 3. Inventory Stats
        var totalParts = await _context.Parts.CountAsync();
        var totalStock = await _context.Parts.SumAsync(p => p.StockQuantity);
        var lowStockCount = await _context.Parts.CountAsync(p => p.StockQuantity > 0 && p.StockQuantity < 10);
        var outOfStockCount = await _context.Parts.CountAsync(p => p.StockQuantity == 0);
        var totalInventoryValue = await _context.Parts.SumAsync(p => p.StockQuantity * (p.CostPrice > 0 ? p.CostPrice : p.Price));

        // 4. Alerts (Low stock + Unpaid Credit)
        var unpaidInvoices = await _context.SalesInvoices.CountAsync(i => i.PaymentStatus == "Credit");
        var totalVendors = await _context.Vendors.CountAsync();
        var pendingAppointments = await _context.ServiceAppointments.CountAsync(a => a.Status == "Pending");
        var pendingPartRequests = await _context.PartRequests.CountAsync(r => r.Status == "Pending" || r.Status == "Checking");
        var pendingOrderRequests = await _context.OrderRequests.CountAsync(r => r.Status == "Pending");
        var purchaseInvoiceCount = await _context.PurchaseInvoices.CountAsync();
        var totalPurchaseAmount = await _context.PurchaseInvoices.SumAsync(i => i.TotalAmount);

        // 5. Recent Sales
        var recentSales = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(5)
            .Select(s => new {
                name = s.Customer.User.FullName,
                date = s.InvoiceDate.ToString("MM/dd/yyyy"),
                amount = $"Rs.{s.FinalAmount:N0}",
                status = s.PaymentStatus
            })
            .ToListAsync();

        var recentPurchases = await _context.PurchaseInvoices
            .Include(i => i.Vendor)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(5)
            .Select(i => new
            {
                invoiceNumber = i.InvoiceNumber,
                vendorName = i.Vendor != null ? i.Vendor.CompanyName : "Unknown Vendor",
                date = i.InvoiceDate.ToString("MM/dd/yyyy"),
                amount = $"Rs.{i.TotalAmount:N0}"
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers,
                totalCustomers,
                totalStaff,
                totalRevenue,
                invoiceCount,
                totalParts,
                totalStock,
                lowStockCount,
                outOfStockCount,
                totalInventoryValue,
                unpaidInvoices,
                totalVendors,
                pendingAppointments,
                pendingPartRequests,
                pendingOrderRequests,
                purchaseInvoiceCount,
                totalPurchaseAmount,
                recentSales,
                recentPurchases
            }
        });
    }

    /// <summary>
    /// Returns all users, optionally filtered by role.
    /// </summary>
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

    /// <summary>
    /// Returns a user by identifier.
    /// </summary>
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

    /// <summary>
    /// Toggles a user active status.
    /// </summary>
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

    /// <summary>
    /// Deletes a non-admin user.
    /// </summary>
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
