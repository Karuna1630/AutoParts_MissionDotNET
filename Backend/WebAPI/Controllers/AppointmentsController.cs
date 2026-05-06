using Application.DTOs.Appointment;
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
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IGenericRepository<ServiceAppointment> _appointmentRepo;
    private readonly IGenericRepository<ServiceReview> _reviewRepo;
    private readonly IGenericRepository<Customer> _customerRepo;
    private readonly IGenericRepository<Vehicle> _vehicleRepo;

    public AppointmentsController(
        IGenericRepository<ServiceAppointment> appointmentRepo,
        IGenericRepository<ServiceReview> reviewRepo,
        IGenericRepository<Customer> customerRepo,
        IGenericRepository<Vehicle> vehicleRepo)
    {
        _appointmentRepo = appointmentRepo;
        _reviewRepo = reviewRepo;
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        // Verify vehicle belongs to customer
        var vehicle = await _vehicleRepo.Query().FirstOrDefaultAsync(v => v.Id == dto.VehicleId && v.CustomerId == customer.Id);
        if (vehicle == null) return BadRequest(new { success = false, message = "Invalid vehicle selected." });

        // Convert date to UTC
        var preferredDateUtc = DateTime.SpecifyKind(dto.PreferredDate.Date, DateTimeKind.Utc);

        // Validate date: not in the past, not more than 30 days ahead
        if (preferredDateUtc < DateTime.UtcNow.Date)
            return BadRequest(new { success = false, message = "Cannot book appointments in the past." });
        if (preferredDateUtc > DateTime.UtcNow.Date.AddDays(30))
            return BadRequest(new { success = false, message = "Cannot book more than 30 days in advance." });

        // Validate priority
        var validPriorities = new[] { "Normal", "Urgent", "Emergency" };
        if (!validPriorities.Contains(dto.Priority))
            return BadRequest(new { success = false, message = "Invalid priority level." });

        // Check slot availability (max 5 per time slot per date)
        var slotsBooked = await _appointmentRepo.Query()
            .CountAsync(a => a.PreferredDate == preferredDateUtc
                          && a.PreferredTime == dto.PreferredTime
                          && a.Status != "Cancelled");

        if (slotsBooked >= 5)
            return BadRequest(new { success = false, message = "This time slot is fully booked. Please choose another." });

        var appointment = new ServiceAppointment
        {
            CustomerId = customer.Id,
            VehicleId = dto.VehicleId,
            ServiceType = dto.ServiceType,
            PreferredDate = preferredDateUtc,
            PreferredTime = dto.PreferredTime,
            Priority = dto.Priority,
            Notes = dto.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _appointmentRepo.AddAsync(appointment);
        await _appointmentRepo.SaveChangesAsync();

        return Ok(new { 
            success = true, 
            message = "Appointment booked successfully.", 
            data = new { 
                appointment.Id, 
                appointment.ServiceType, 
                appointment.PreferredDate, 
                appointment.PreferredTime, 
                appointment.Status 
            } 
        });
    }

    // Get slot availability for a specific date
    [HttpGet("slots")]
    public async Task<IActionResult> GetSlotAvailability([FromQuery] string date)
    {
        if (!DateTime.TryParse(date, out var parsedDate))
            return BadRequest(new { success = false, message = "Invalid date format." });

        var parsedDateUtc = DateTime.SpecifyKind(parsedDate.Date, DateTimeKind.Utc);
        var timeSlots = new[] { "Morning (9 AM \u2013 12 PM)", "Afternoon (1 PM \u2013 5 PM)", "Evening (5 PM \u2013 8 PM)" };
        var slotData = new List<object>();

        foreach (var slot in timeSlots)
        {
            var count = await _appointmentRepo.Query()
                .CountAsync(a => a.PreferredDate == parsedDateUtc
                              && a.PreferredTime == slot
                              && a.Status != "Cancelled");

            slotData.Add(new { slot, booked = count, available = 5 - count, isFull = count >= 5 });
        }

        return Ok(new { success = true, data = slotData });
    }

    [HttpGet("my-appointments")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        var appointments = await _appointmentRepo.Query()
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .Include(a => a.Vehicle)
            .Include(a => a.Review)
            .Include(a => a.AssignedStaff)
            .Where(a => a.CustomerId == customer.Id)
            .OrderByDescending(a => a.PreferredDate)
            .Select(a => new ViewAppointmentDto
            {
                Id = a.Id,
                VehicleId = a.VehicleId,
                VehicleName = $"{a.Vehicle!.VehicleMake} {a.Vehicle.VehicleModel} ({a.Vehicle.VehicleNumber})",
                VehicleImageUrl = a.Vehicle.ImageUrl,
                ServiceType = a.ServiceType,
                PreferredDate = a.PreferredDate,
                PreferredTime = a.PreferredTime,
                Priority = a.Priority,
                Status = a.Status,
                Notes = a.Notes,
                CancellationReason = a.CancellationReason,
                CreatedAt = a.CreatedAt,
                CustomerAvatarUrl = a.Customer!.User!.AvatarUrl,
                AssignedStaffId = a.AssignedStaffId,
                AssignedStaffName = a.AssignedStaff != null ? a.AssignedStaff.FullName : null,
                Review = a.Review != null ? new ViewReviewDto
                {
                    Rating = a.Review.Rating,
                    Comment = a.Review.Comment,
                    WouldRecommend = a.Review.WouldRecommend,
                    CreatedAt = a.Review.CreatedAt
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = appointments });
    }

    [HttpPost("review")]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        var appointment = await _appointmentRepo.Query()
            .Include(a => a.Review)
            .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId && a.CustomerId == customer.Id);

        if (appointment == null) return NotFound(new { success = false, message = "Appointment not found." });
        
        if (appointment.Status != "Completed") 
            return BadRequest(new { success = false, message = "Reviews can only be added for completed appointments." });

        var existingReview = await _reviewRepo.Query().FirstOrDefaultAsync(r => r.AppointmentId == dto.AppointmentId);
        if (existingReview != null)
            return BadRequest(new { success = false, message = "A review already exists for this appointment." });

        if (dto.Comment.Length < 10)
            return BadRequest(new { success = false, message = "Comment must be at least 10 characters." });

        var review = new ServiceReview
        {
            AppointmentId = dto.AppointmentId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            WouldRecommend = dto.WouldRecommend,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepo.AddAsync(review);
        await _reviewRepo.SaveChangesAsync();

        return Ok(new { 
            success = true, 
            message = "Review submitted successfully.", 
            data = new { 
                review.Id, 
                review.Rating, 
                review.Comment, 
                review.CreatedAt 
            } 
        });
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return BadRequest(new { success = false, message = "Customer profile not found." });

        var appointment = await _appointmentRepo.Query()
            .FirstOrDefaultAsync(a => a.Id == id && a.CustomerId == customer.Id);

        if (appointment == null) return NotFound(new { success = false, message = "Appointment not found." });

        if (appointment.Status != "Pending" && appointment.Status != "Confirmed")
            return BadRequest(new { success = false, message = "Only Pending or Confirmed appointments can be cancelled." });

        appointment.Status = "Cancelled";
        _appointmentRepo.Update(appointment);
        await _appointmentRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Appointment cancelled successfully." });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllAppointments()
    {
        var appointments = await _appointmentRepo.Query()
            .Include(a => a.Customer).ThenInclude(c => c.User)
            .Include(a => a.Vehicle)
            .Include(a => a.Review)
            .Include(a => a.AssignedStaff)
            .OrderByDescending(a => a.PreferredDate)
            .Select(a => new ViewAppointmentDto
            {
                Id = a.Id,
                VehicleId = a.VehicleId,
                VehicleName = $"{a.Vehicle!.VehicleMake} {a.Vehicle.VehicleModel} ({a.Vehicle.VehicleNumber})",
                VehicleImageUrl = a.Vehicle.ImageUrl,
                ServiceType = a.ServiceType,
                PreferredDate = a.PreferredDate,
                PreferredTime = a.PreferredTime,
                Priority = a.Priority,
                Status = a.Status,
                Notes = a.Notes,
                CancellationReason = a.CancellationReason,
                CreatedAt = a.CreatedAt,
                CustomerName = a.Customer!.User!.FullName,
                CustomerEmail = a.Customer!.User!.Email,
                CustomerAvatarUrl = a.Customer!.User!.AvatarUrl,
                AssignedStaffId = a.AssignedStaffId,
                AssignedStaffName = a.AssignedStaff != null ? a.AssignedStaff.FullName : null,
                Review = a.Review != null ? new ViewReviewDto
                {
                    Rating = a.Review.Rating,
                    Comment = a.Review.Comment,
                    WouldRecommend = a.Review.WouldRecommend,
                    CreatedAt = a.Review.CreatedAt
                } : null
            })
            .ToListAsync();

        return Ok(new { success = true, data = appointments });
    }

    [HttpPatch("{id}/claim")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Claim(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var appointment = await _appointmentRepo.GetByIdAsync(id);
        if (appointment == null) return NotFound(new { success = false, message = "Appointment not found." });

        if (appointment.Status != "Pending")
            return BadRequest(new { success = false, message = "Only pending appointments can be claimed." });

        appointment.Status = "Confirmed";
        appointment.AssignedStaffId = userId;
        _appointmentRepo.Update(appointment);
        await _appointmentRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Appointment claimed and confirmed." });
    }

    [HttpPatch("{id}/complete")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Complete(int id)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(id);
        if (appointment == null) return NotFound(new { success = false, message = "Appointment not found." });

        if (appointment.Status != "Confirmed")
            return BadRequest(new { success = false, message = "Only confirmed appointments can be marked as completed." });

        appointment.Status = "Completed";
        _appointmentRepo.Update(appointment);
        await _appointmentRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Appointment marked as completed." });
    }

    [HttpPatch("{id}/staff-cancel")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> StaffCancel(int id, [FromBody] string reason)
    {
        var appointment = await _appointmentRepo.GetByIdAsync(id);
        if (appointment == null) return NotFound(new { success = false, message = "Appointment not found." });

        if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
            return BadRequest(new { success = false, message = "Cannot cancel completed or already cancelled appointments." });

        appointment.Status = "Cancelled";
        appointment.CancellationReason = reason;
        _appointmentRepo.Update(appointment);
        await _appointmentRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Appointment cancelled by staff." });
    }
}
