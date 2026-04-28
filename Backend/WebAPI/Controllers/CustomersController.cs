using System.Security.Claims;
using Application.DTOs.Vehicle;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/customers/vehicles")]
public class CustomersController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public CustomersController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
    }

    private int GetCurrentUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpPost]
    public async Task<IActionResult> AddVehicle([FromForm] CreateVehicleDto dto)
    {
        var result = await _vehicleService.AddVehicleAsync(GetCurrentUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyVehicles()
    {
        var result = await _vehicleService.GetCustomerVehiclesAsync(GetCurrentUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{vehicleId}")]
    public async Task<IActionResult> GetVehicle(int vehicleId)
    {
        var result = await _vehicleService.GetVehicleByIdAsync(vehicleId, GetCurrentUserId());
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("{vehicleId}/update")]
    public async Task<IActionResult> UpdateVehicle(int vehicleId, [FromForm] UpdateVehicleDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = string.Join(" | ", ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage));
            return BadRequest(new { success = false, message = "Validation failed", errors });
        }
        var result = await _vehicleService.UpdateVehicleAsync(vehicleId, GetCurrentUserId(), dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{vehicleId}")]
    public async Task<IActionResult> DeleteVehicle(int vehicleId)
    {
        var result = await _vehicleService.DeleteVehicleAsync(vehicleId, GetCurrentUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{vehicleId}/primary")]
    public async Task<IActionResult> SetAsPrimary(int vehicleId)
    {
        var result = await _vehicleService.SetPrimaryVehicleAsync(vehicleId, GetCurrentUserId());
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
