using Application.DTOs.SalesInvoice;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPI.Controllers;

[Authorize(Roles = $"{UserRoles.Staff},{UserRoles.Admin}")]
[ApiController]
[Route("api/[controller]")]
public class SalesInvoiceController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;

    public SalesInvoiceController(ISalesInvoiceService salesInvoiceService)
    {
        _salesInvoiceService = salesInvoiceService;
    }

    private Guid? GetCurrentUserId()
    {
        var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idValue, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var invoices = await _salesInvoiceService.GetAllAsync(cancellationToken);
        return Ok(new { success = true, data = invoices });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var invoice = await _salesInvoiceService.GetByIdAsync(id, cancellationToken);
        if (invoice == null)
        {
            return NotFound();
        }

        return Ok(new { success = true, data = invoice });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSalesInvoiceDto dto, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { message = "Validation failed", errors });
        }

        var result = await _salesInvoiceService.CreateAsync(dto, GetCurrentUserId(), cancellationToken);
        return Ok(new { success = true, data = result });
    }
}
