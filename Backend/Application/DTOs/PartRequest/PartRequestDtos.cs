using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.PartRequest;

public class CreatePartRequestDto
{
    [Required]
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VehicleInfo { get; set; }
    public Microsoft.AspNetCore.Http.IFormFile? Image { get; set; }
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
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public string Urgency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public int? PartId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StaffViewPartRequestDto : ViewPartRequestDto
{
    public CustomerInfoDto? Customer { get; set; }
}

public class CustomerInfoDto
{
    public int Id { get; set; }
    public UserInfoDto? User { get; set; }
}

public class UserInfoDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}
