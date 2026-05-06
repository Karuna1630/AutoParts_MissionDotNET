using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("ServiceReviews")]
public class ServiceReview
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int AppointmentId { get; set; }

    [ForeignKey(nameof(AppointmentId))]
    public ServiceAppointment? Appointment { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [MaxLength(1000)]
    [MinLength(10)]
    public string Comment { get; set; } = string.Empty;

    public bool WouldRecommend { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
