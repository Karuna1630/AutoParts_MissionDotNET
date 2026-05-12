using Application.Common;
using Application.DTOs.Sales;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Domain.Entities;

namespace WebAPI.Controllers;

[Authorize(Roles = UserRoles.Admin + "," + UserRoles.Staff)]
[ApiController]
[Route("api/[controller]")]
public class PosController : ControllerBase
{
    private readonly ISalesService _salesService;

    public PosController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpPost("invoice")]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateSalesInvoiceDto dto)
    {
        var staffIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(staffIdStr) || !int.TryParse(staffIdStr, out var staffId))
        {
            return Unauthorized(new { success = false, message = "Invalid staff ID in token." });
        }

        var result = await _salesService.CreateInvoiceAsync(dto, staffId);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("invoice/{id}")]
    public async Task<IActionResult> GetInvoiceById(int id)
    {
        var result = await _salesService.GetInvoiceByIdAsync(id);
        if (!result.Success) return NotFound(result);

        return Ok(result);
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetAllInvoices()
    {
        var result = await _salesService.GetAllInvoicesAsync();
        return Ok(result);
    }

    [HttpPut("invoice/{id}/payment")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentUpdateRequest request)
    {
        var result = await _salesService.UpdatePaymentStatusAsync(id, request.Status, request.AmountPaid);
        if (!result.Success) return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("parts/search")]
    public async Task<IActionResult> SearchParts([FromQuery] string query = "")
    {
        try
        {
            // If query is empty, the service returns the latest parts
            var parts = await _salesService.SearchPartsAsync(query);
            var availableParts = parts.Where(p => p.StockQuantity > 0).ToList();
            
            return Ok(new { success = true, data = availableParts });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("customers/search")]
    public async Task<IActionResult> SearchCustomers([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Ok(new { success = true, data = new List<Customer>() });

        var customers = await _salesService.SearchCustomersAsync(query);
        return Ok(new { success = true, data = customers });
    }
}

public class PaymentUpdateRequest
{
    public string Status { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
}
