using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("ServiceAppointments")]
public class ServiceAppointment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public Customer? Customer { get; set; }

    [Required]
    public int VehicleId { get; set; }

    [ForeignKey(nameof(VehicleId))]
    public Vehicle? Vehicle { get; set; }

    [Required]
    [MaxLength(100)]
    public string ServiceType { get; set; } = string.Empty;

    [Required]
    public DateTime PreferredDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string PreferredTime { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Priority { get; set; } = "Normal"; // Normal, Urgent, Emergency

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled

    [MaxLength(500)]
    public string? Notes { get; set; }

    public int? AssignedStaffId { get; set; }

    [ForeignKey(nameof(AssignedStaffId))]
    public User? AssignedStaff { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for review
    public ServiceReview? Review { get; set; }
}
