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
    public string Role { get; set; } = UserRole.CUSTOMER.ToString();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    [MaxLength(250)]
    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}