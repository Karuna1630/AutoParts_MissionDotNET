using Application.Common;
using Application.DTOs.PartRequest;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
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

/// <summary>
/// Exposes part request workflows.
/// </summary>
[Authorize]
[ApiController]
[Route("api/partrequests")]
public class PartRequestsController : ControllerBase
{
    private readonly IGenericRepository<PartRequest> _requestRepo;
    private readonly IGenericRepository<Part> _partRepo;
    private readonly IGenericRepository<Customer> _customerRepo;
    private readonly IImageService _imageService;

    public PartRequestsController(
        IGenericRepository<PartRequest> requestRepo,
        IGenericRepository<Part> partRepo,
        IGenericRepository<Customer> customerRepo,
        IImageService imageService)
    {
        _requestRepo = requestRepo;
        _partRepo = partRepo;
        _customerRepo = customerRepo;
        _imageService = imageService;
    }

    /// <summary>
    /// Creates a part request.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreatePartRequestDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        string? imageUrl = null;
        if (dto.Image != null)
        {
            imageUrl = await _imageService.UploadImageAsync(dto.Image, "PartRequests");
        }

        var request = new PartRequest
        {
            CustomerId = customer.Id,
            PartName = dto.PartName,
            Description = dto.Description,
            VehicleInfo = dto.VehicleInfo,
            ImageUrl = imageUrl,
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

    /// <summary>
    /// Returns the current customer's part requests.
    /// </summary>
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
                ImageUrl = r.ImageUrl,
                Price = r.Price,
                PartId = r.PartId,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = requests });
    }

    /// <summary>
    /// Returns all part requests for staff and admins.
    /// </summary>
    [HttpGet("all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _requestRepo.Query()
            .AsNoTracking()
            .Include(r => r.Customer)
                .ThenInclude(c => c.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new StaffViewPartRequestDto
            {
                Id = r.Id,
                PartName = r.PartName,
                Description = r.Description,
                VehicleInfo = r.VehicleInfo,
                ImageUrl = r.ImageUrl,
                Quantity = r.Quantity,
                Urgency = r.Urgency,
                Status = r.Status,
                Price = r.Price,
                PartId = r.PartId,
                CreatedAt = r.CreatedAt,
                Customer = r.Customer != null ? new CustomerInfoDto
                {
                    Id = r.Customer.Id,
                    User = r.Customer.User != null ? new UserInfoDto
                    {
                        FullName = r.Customer.User.FullName,
                        Email = r.Customer.User.Email,
                        Phone = r.Customer.User.Phone
                    } : null
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = requests });
    }

    /// <summary>
    /// Updates a part request status.
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return NotFound(new { success = false, message = "Request not found." });

        request.Status = dto.Status;
        if (dto.Price.HasValue) request.Price = dto.Price.Value;
        request.UpdatedAt = DateTime.UtcNow;

        // If arrived, create a "Shadow Part" in the main Parts table so it can be ordered via Cart
        if (dto.Status == "Arrived" && !request.PartId.HasValue)
        {
            var part = new Part
            {
                Name = request.PartName,
                SKU = $"REQ-{request.Id}",
                Price = request.Price ?? 0,
                CostPrice = request.Price ?? 0, // Placeholder
                StockQuantity = request.Quantity,
                Category = "Special Request",
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };
            await _partRepo.AddAsync(part);
            await _partRepo.SaveChangesAsync();
            request.PartId = part.Id;
        }
        else if (dto.Status == "Arrived" && request.PartId.HasValue)
        {
            // Update existing part price/stock if needed
            var part = await _partRepo.GetByIdAsync(request.PartId.Value);
            if (part != null)
            {
                part.Price = request.Price ?? 0;
                part.StockQuantity = request.Quantity;
                _partRepo.Update(part);
                await _partRepo.SaveChangesAsync();
            }
        }

        _requestRepo.Update(request);
        await _requestRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Status updated successfully." });
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = string.Empty;
    public decimal? Price { get; set; }
}
