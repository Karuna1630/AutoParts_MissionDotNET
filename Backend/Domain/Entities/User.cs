using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

[Table("Users")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = UserRole.Customer.ToString();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}