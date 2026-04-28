using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("Vehicles")]
public class Vehicle
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User? Customer { get; set; }

    [Required]
    [MaxLength(20)]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string VehicleModel { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string VehicleMake { get; set; } = string.Empty;

    [Range(1950, 2026)]
    public int VehicleYear { get; set; }

    [MaxLength(30)]
    public string? VehicleColor { get; set; }

    public bool IsPrimary { get; set; } = false;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
