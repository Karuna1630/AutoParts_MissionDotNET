using Application.Interfaces.Services;
using Domain.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebAPI.Controllers;

[Authorize(Roles = UserRoles.Admin + "," + UserRoles.Staff + "," + UserRoles.Customer)]
[ApiController]
[Route("api/parts")]
public class PartsController : ControllerBase
{
    private readonly ISalesService _salesService;

    public PartsController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var parts = await _salesService.SearchPartsAsync("");
        return Ok(new { success = true, data = parts });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query = "")
    {
        // Customers can search for parts to see what's available
        var parts = await _salesService.SearchPartsAsync(query);
        var availableParts = parts.Where(p => p.StockQuantity > 0).ToList();
        
        return Ok(new { success = true, data = availableParts });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        // This could be used for a part detail page
        // For now using the generic repo isn't directly exposed in SalesService for single part
        // But we can add it or just search and find.
        // Let's assume we just need search for now as per POS pattern.
        return Ok(new { success = false, message = "Detail view not implemented yet." });
    }
}
