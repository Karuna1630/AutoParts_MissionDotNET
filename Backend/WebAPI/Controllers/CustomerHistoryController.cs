using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

/// <summary>
/// Exposes customer history endpoints.
/// </summary>
[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/customers/history")]
public class CustomerHistoryController : ControllerBase
{
    private readonly ICustomerHistoryService _historyService;
    private readonly Application.Interfaces.Repositories.IGenericRepository<Domain.Entities.Customer> _customerRepo;

    public CustomerHistoryController(
        ICustomerHistoryService historyService,
        Application.Interfaces.Repositories.IGenericRepository<Domain.Entities.Customer> customerRepo)
    {
        _historyService = historyService;
        _customerRepo = customerRepo;
    }

    private async Task<int?> GetCustomerIdAsync()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return null;

        var customer = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            _customerRepo.Query(), c => c.UserId == userId);
        
        return customer?.Id;
    }

    /// <summary>
    /// Returns purchase history for the current customer.
    /// </summary>
    [HttpGet("purchases")]
    public async Task<IActionResult> GetPurchaseHistory([FromQuery] int? vehicleId, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] string? status)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return NotFound(new { success = false, message = "Customer profile record not found for this user." });

        var result = await _historyService.GetPurchaseHistoryAsync(customerId.Value, vehicleId, fromDate, toDate, status);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns service history for the current customer.
    /// </summary>
    [HttpGet("services")]
    public async Task<IActionResult> GetServiceHistory([FromQuery] int? vehicleId, [FromQuery] string? status)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return NotFound(new { success = false, message = "Customer profile record not found for this user." });

        var result = await _historyService.GetServiceHistoryAsync(customerId.Value, vehicleId, status);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns combined purchase and service history.
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetCombinedHistory()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return NotFound(new { success = false, message = "Customer profile record not found for this user." });

        var result = await _historyService.GetCombinedHistoryAsync(customerId.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Returns a single purchase record.
    /// </summary>
    [HttpGet("purchases/{invoiceId}")]
    public async Task<IActionResult> GetSinglePurchase(int invoiceId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");

        var result = await _historyService.GetSinglePurchaseAsync(customerId.Value, invoiceId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Returns a single service record.
    /// </summary>
    [HttpGet("services/{appointmentId}")]
    public async Task<IActionResult> GetSingleService(int appointmentId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");

        var result = await _historyService.GetSingleServiceAsync(customerId.Value, appointmentId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Returns a history summary.
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return NotFound(new { success = false, message = "Customer profile record not found for this user." });

        var result = await _historyService.GetHistorySummaryAsync(customerId.Value);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Exports customer history as PDF.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportHistory([FromQuery] string format = "pdf")
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");

        var result = await _historyService.ExportHistoryAsPdfAsync(customerId.Value);
        if (!result.Success || result.Data == null) 
        {
            return BadRequest(result.Message ?? "Failed to generate history PDF");
        }
        return File(result.Data, "application/pdf", $"CustomerHistory_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }

    /// <summary>
    /// Downloads a single invoice PDF.
    /// </summary>
    [HttpGet("invoice/{invoiceId}/download")]
    public async Task<IActionResult> DownloadInvoice(int invoiceId)
    {
        var customerId = await GetCustomerIdAsync();
        if (customerId == null) return Unauthorized("Customer profile not found.");

        var result = await _historyService.DownloadSingleInvoicePdfAsync(customerId.Value, invoiceId);
        if (!result.Success || result.Data == null)
        {
            return NotFound(result.Message ?? "Invoice PDF not found");
        }
        return File(result.Data, "application/pdf", $"Invoice_{invoiceId}.pdf");
    }
}
