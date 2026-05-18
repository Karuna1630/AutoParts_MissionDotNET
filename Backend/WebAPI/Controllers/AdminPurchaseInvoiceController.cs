using Application.Common;
using Application.DTOs.PurchaseInvoice;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Common;

namespace WebAPI.Controllers;

[Authorize(Roles = UserRoles.Admin)]
[ApiController]
[Route("api/admin/purchase-invoices")]
public class AdminPurchaseInvoiceController : ControllerBase
{
    private readonly IPurchaseInvoiceService _purchaseInvoiceService;

    public AdminPurchaseInvoiceController(IPurchaseInvoiceService purchaseInvoiceService)
    {
        _purchaseInvoiceService = purchaseInvoiceService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] CreatePurchaseInvoiceDto dto)
    {
        var adminIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(adminIdStr, out int adminId))
        {
            return Unauthorized(new ApiResponse<string> { Success = false, Message = "Invalid admin identity." });
        }

        var result = await _purchaseInvoiceService.CreatePurchaseInvoiceAsync(dto, adminId);
        if (!result.Success)
        {
            return BadRequest(new ApiResponse<PurchaseInvoiceResponseDto>
            {
                Success = false,
                Message = result.Message
            });
        }

        return Ok(new ApiResponse<PurchaseInvoiceResponseDto>
        {
            Success = true,
            Message = result.Message,
            Data = result.Data
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetInvoice(int id)
    {
        var result = await _purchaseInvoiceService.GetPurchaseInvoiceByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(new ApiResponse<PurchaseInvoiceResponseDto>
            {
                Success = false,
                Message = result.Message
            });
        }

        return Ok(new ApiResponse<PurchaseInvoiceResponseDto>
        {
            Success = true,
            Data = result.Data
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllInvoices([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _purchaseInvoiceService.GetAllPurchaseInvoicesAsync(pageNumber, pageSize);
        return Ok(new ApiResponse<List<PurchaseInvoiceResponseDto>>
        {
            Success = true,
            Data = result.Data
        });
    }
}
