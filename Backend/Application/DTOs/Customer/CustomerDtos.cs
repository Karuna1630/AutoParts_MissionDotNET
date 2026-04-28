using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Customer;

public class RegisterCustomerWithVehicleDto
{
    // Customer Details
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;

    // Vehicle Details
    [Required]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    public string VehicleModel { get; set; } = string.Empty;

    [Required]
    public string VehicleMake { get; set; } = string.Empty;

    [Required]
    public int VehicleYear { get; set; }

    public string? VehicleColor { get; set; }
}

public class CustomerSearchDto
{
    public string? Query { get; set; } // Email, Phone, or Vehicle Number
}

public class CustomerResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal CreditBalance { get; set; }
    public List<CustomerVehicleResponseDto> Vehicles { get; set; } = new();
}

public class CustomerVehicleResponseDto
{
    public int Id { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleMake { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public string? VehicleColor { get; set; }
    public bool IsPrimary { get; set; }
}

public class AddVehicleToCustomerDto
{
    [Required]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    public string VehicleModel { get; set; } = string.Empty;

    [Required]
    public string VehicleMake { get; set; } = string.Empty;

    [Required]
    public int VehicleYear { get; set; }

    public string? VehicleColor { get; set; }
}
