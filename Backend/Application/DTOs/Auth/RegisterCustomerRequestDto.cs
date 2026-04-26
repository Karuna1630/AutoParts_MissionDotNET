using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Auth;

public class RegisterCustomerRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, Phone]
    public string Phone { get; set; } = string.Empty;
}
