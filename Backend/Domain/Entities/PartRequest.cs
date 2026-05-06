using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("PartRequests")]
public class PartRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public Customer? Customer { get; set; }

    [Required]
    [MaxLength(200)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(200)]
    public string? VehicleInfo { get; set; }

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [MaxLength(20)]
    public string Urgency { get; set; } = "Normal"; // Normal, Soon, Urgent

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Checking, Ordered, Arrived, Notified

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
