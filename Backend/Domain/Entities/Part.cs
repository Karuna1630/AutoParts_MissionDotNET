using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("Parts")]
public class Part
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string SKU { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Category { get; set; }

    [Required]
    public int StockQuantity { get; set; } = 0; // The unified stock field

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }  // Selling price

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostPrice { get; set; } = 0; // Purchase cost

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
