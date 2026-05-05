using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Appointment;

public class CreateAppointmentDto
{
    [Required]
    public int VehicleId { get; set; }
    [Required]
    public string ServiceType { get; set; } = string.Empty;
    [Required]
    public DateTime PreferredDate { get; set; }
    [Required]
    public string PreferredTime { get; set; } = string.Empty;
    [Required]
    public string Priority { get; set; } = "Normal";
    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class ViewAppointmentDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public string VehicleName { get; set; } = string.Empty;
    public string? VehicleImageUrl { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public DateTime PreferredDate { get; set; }
    public string PreferredTime { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Customer Info
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerAvatarUrl { get; set; }
    
    // Staff Info
    public int? AssignedStaffId { get; set; }
    public string? AssignedStaffName { get; set; }
    
    public ViewReviewDto? Review { get; set; }
}

public class CreateReviewDto
{
    [Required]
    public int AppointmentId { get; set; }
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }
    [Required]
    [MinLength(10)]
    [MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
    public bool WouldRecommend { get; set; } = true;
}

public class ViewReviewDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool WouldRecommend { get; set; }
    public DateTime CreatedAt { get; set; }
}
