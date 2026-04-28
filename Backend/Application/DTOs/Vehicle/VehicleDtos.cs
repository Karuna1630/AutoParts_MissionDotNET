using System.ComponentModel.DataAnnotations;

using Microsoft.AspNetCore.Http;

namespace Application.DTOs.Vehicle;

public class CreateVehicleDto
{
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

    public IFormFile? Image { get; set; }
}

public class UpdateVehicleDto
{
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

    public IFormFile? Image { get; set; }
    
    public bool IsPrimary { get; set; }
}

public class VehicleResponseDto
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public string? VehicleColor { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsPrimary { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
