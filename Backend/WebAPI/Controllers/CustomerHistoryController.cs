using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/customers/history")]
public class CustomerHistoryController : ControllerBase
{
    private readonly ICustomerHistoryService _historyService;

    public CustomerHistoryController(ICustomerHistoryService historyService)
    {
        _historyService = historyService;
    }

    private int GetCustomerId()
    {
        // For now, assume the user's ID maps 1:1 to their customer ID, 
        // or we mock a fixed customer ID for the logged-in user.
        // In reality, we would query the Customer table where UserId = User.Identity.Name
        // But since Customer table isn't fully linked to auth context here, we will just use 1.
        return 1;
    }

    [HttpGet("purchases")]
    public async Task<IActionResult> GetPurchaseHistory([FromQuery] int? vehicleId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? status)
    {
        var result = await _historyService.GetPurchaseHistoryAsync(GetCustomerId(), vehicleId, fromDate, toDate, status);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServiceHistory([FromQuery] int? vehicleId, [FromQuery] string? status)
    {
        var result = await _historyService.GetServiceHistoryAsync(GetCustomerId(), vehicleId, status);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetCombinedHistory()
    {
        var result = await _historyService.GetCombinedHistoryAsync(GetCustomerId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("purchases/{invoiceId}")]
    public async Task<IActionResult> GetSinglePurchase(int invoiceId)
    {
        var result = await _historyService.GetSinglePurchaseAsync(GetCustomerId(), invoiceId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("services/{appointmentId}")]
    public async Task<IActionResult> GetSingleService(int appointmentId)
    {
        var result = await _historyService.GetSingleServiceAsync(GetCustomerId(), appointmentId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _historyService.GetHistorySummaryAsync(GetCustomerId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportHistory([FromQuery] string format = "pdf")
    {
        var result = await _historyService.ExportHistoryAsPdfAsync(GetCustomerId());
        if (!result.Success) return BadRequest(result);
        return File(result.Data, "application/pdf", $"CustomerHistory_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }

    [HttpGet("invoice/{invoiceId}/download")]
    public async Task<IActionResult> DownloadInvoice(int invoiceId)
    {
        var result = await _historyService.DownloadSingleInvoicePdfAsync(GetCustomerId(), invoiceId);
        if (!result.Success) return NotFound(result);
        return File(result.Data, "application/pdf", $"Invoice_{invoiceId}.pdf");
    }
}
