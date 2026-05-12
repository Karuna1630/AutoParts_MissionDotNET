using Application.Common;
using Application.DTOs.Customer;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Common;

namespace WebAPI.Controllers;

[Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Staff}")]
[ApiController]
[Route("api/staff/customers")]
public class StaffCustomersController : ControllerBase
{
    private readonly IStaffCustomerService _staffCustomerService;
    private readonly ICustomerHistoryService _historyService;

    public StaffCustomersController(IStaffCustomerService staffCustomerService, ICustomerHistoryService historyService)
    {
        _staffCustomerService = staffCustomerService;
        _historyService = historyService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterCustomer([FromForm] RegisterCustomerWithVehicleDto dto)
    {
        var result = await _staffCustomerService.RegisterCustomerAsync(dto);
        if (!result.Success)
        {
            return BadRequest(new ApiResponse<CustomerResponseDto>
            {
                Success = false,
                Message = result.Message,
                Errors = result.Errors
            });
        }

        return Ok(new ApiResponse<CustomerResponseDto>
        {
            Success = true,
            Message = result.Message,
            Data = result.Data
        });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchCustomers([FromQuery] string query)
    {
        var result = await _staffCustomerService.SearchCustomersAsync(query);
        return Ok(new ApiResponse<List<CustomerResponseDto>>
        {
            Success = true,
            Data = result.Data
        });
    }

    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCustomerDetails(int customerId)
    {
        var result = await _staffCustomerService.GetCustomerByIdAsync(customerId);
        if (!result.Success)
        {
            return NotFound(new ApiResponse<CustomerResponseDto>
            {
                Success = false,
                Message = result.Message
            });
        }

        return Ok(new ApiResponse<CustomerResponseDto>
        {
            Success = true,
            Data = result.Data
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCustomers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _staffCustomerService.GetAllCustomersAsync(pageNumber, pageSize);
        return Ok(new ApiResponse<List<CustomerResponseDto>>
        {
            Success = true,
            Data = result.Data
        });
    }

    [HttpPost("{customerId}/vehicles")]
    public async Task<IActionResult> AddVehicle(int customerId, [FromForm] AddVehicleToCustomerDto dto)
    {
        var result = await _staffCustomerService.AddVehicleAsync(customerId, dto);
        if (!result.Success)
        {
            return BadRequest(new ApiResponse<CustomerResponseDto>
            {
                Success = false,
                Message = result.Message
            });
        }

        return Ok(new ApiResponse<CustomerResponseDto>
        {
            Success = true,
            Message = "Vehicle added successfully",
            Data = result.Data
        });
    }

    [HttpGet("{customerId}/history")]
    public async Task<IActionResult> GetCustomerHistory(int customerId)
    {
        var history = await _historyService.GetCombinedHistoryAsync(customerId);
        if (!history.Success) return NotFound(new { success = false, message = history.Message });
        return Ok(new { success = true, data = history.Data });
    }
}
