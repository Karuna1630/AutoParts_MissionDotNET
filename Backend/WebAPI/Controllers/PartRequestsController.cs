using Application.Common;
using Application.DTOs.PartRequest;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/partrequests")]
public class PartRequestsController : ControllerBase
{
    private readonly IGenericRepository<PartRequest> _requestRepo;
    private readonly IGenericRepository<Customer> _customerRepo;

    public PartRequestsController(
        IGenericRepository<PartRequest> requestRepo,
        IGenericRepository<Customer> customerRepo)
    {
        _requestRepo = requestRepo;
        _customerRepo = customerRepo;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePartRequestDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        var request = new PartRequest
        {
            CustomerId = customer.Id,
            PartName = dto.PartName,
            Description = dto.Description,
            VehicleInfo = dto.VehicleInfo,
            Quantity = dto.Quantity,
            Urgency = dto.Urgency,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _requestRepo.AddAsync(request);
        await _requestRepo.SaveChangesAsync();

        return Ok(new { 
            success = true, 
            message = "Part request submitted successfully.", 
            data = new { 
                request.Id, 
                request.PartName, 
                request.Status, 
                request.CreatedAt 
            } 
        });
    }

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        var requests = await _requestRepo.Query()
            .Where(r => r.CustomerId == customer.Id)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ViewPartRequestDto
            {
                Id = r.Id,
                PartName = r.PartName,
                Description = r.Description,
                VehicleInfo = r.VehicleInfo,
                Quantity = r.Quantity,
                Urgency = r.Urgency,
                Status = r.Status,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = requests });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _requestRepo.Query()
            .Include(r => r.Customer).ThenInclude(c => c!.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = requests });
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return NotFound(new { success = false, message = "Request not found." });

        request.Status = dto.Status;
        request.UpdatedAt = DateTime.UtcNow;

        _requestRepo.Update(request);
        await _requestRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Status updated successfully." });
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
}
