using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyReport([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var result = await _reportService.GenerateDailyReportAsync(targetDate);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int? year, [FromQuery] int? month)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var targetMonth = month ?? DateTime.UtcNow.Month;
        var result = await _reportService.GenerateMonthlyReportAsync(targetYear, targetMonth);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("yearly")]
    public async Task<IActionResult> GetYearlyReport([FromQuery] int? year)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var result = await _reportService.GenerateYearlyReportAsync(targetYear);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
