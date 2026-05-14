using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.DTOs.Report;
using Application.Common;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers;

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

    [HttpGet("reports/daily")]
    public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var result = await _reportService.GenerateDailyReportAsync(targetDate);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("reports/monthly")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var targetMonth = month ?? DateTime.UtcNow.Month;
        var result = await _reportService.GenerateMonthlyReportAsync(targetYear, targetMonth);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("reports/yearly")]
    public async Task<IActionResult> GetYearlyReport([FromQuery] int? year)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var result = await _reportService.GenerateYearlyReportAsync(targetYear);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("reports/range")]
    public async Task<IActionResult> GetRangeReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        if (fromDate > toDate) return BadRequest(new { success = false, message = "From date cannot be after To date." });
        
        var result = await _reportService.GenerateRangeReportAsync(fromDate, toDate);
        return result.Success ? Ok(result) : BadRequest(result);
    }

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

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        // 1. User Stats
        var totalUsers = await _userRepository.CountAllAsync(default);
        var totalCustomers = await _userRepository.CountByRoleAsync(UserRoles.Customer, default);
        
        // 2. Financial Stats (Total)
        var totalRevenue = await _context.SalesInvoices.SumAsync(i => i.FinalAmount);
        var invoiceCount = await _context.SalesInvoices.CountAsync();

        // 3. Inventory Stats
        var totalParts = await _context.Parts.CountAsync();
        var totalStock = await _context.Parts.SumAsync(p => p.StockQuantity);
        var lowStockCount = await _context.Parts.CountAsync(p => p.StockQuantity < 10);

        // 4. Alerts (Low stock + Unpaid Credit)
        var unpaidInvoices = await _context.SalesInvoices.CountAsync(i => i.PaymentStatus == "Credit");

        // 5. Recent Sales
        var recentSales = await _context.SalesInvoices
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .OrderByDescending(i => i.InvoiceDate)
            .Take(5)
            .Select(s => new {
                Name = s.Customer.User.FullName,
                Date = s.InvoiceDate.ToString("MM/dd/yyyy"),
                Amount = $"Rs.{s.FinalAmount:N0}",
                Status = s.PaymentStatus,
                StatusColor = s.PaymentStatus == "Paid" ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-700"
            })
            .ToListAsync();

        return Ok(new
        {
            success = true,
            data = new
            {
                totalUsers,
                totalCustomers,
                totalRevenue,
                invoiceCount,
                totalParts,
                totalStock,
                lowStockCount,
                unpaidInvoices,
                recentSales
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
