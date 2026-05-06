using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.PartRequest;

public class CreatePartRequestDto
{
    [Required]
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VehicleInfo { get; set; }
    [Required]
    public int Quantity { get; set; } = 1;
    [Required]
    public string Urgency { get; set; } = "Normal";
}

public class ViewPartRequestDto
{
    public int Id { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VehicleInfo { get; set; }
    public int Quantity { get; set; }
    public string Urgency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
