using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("SalesInvoiceItems")]
public class SalesInvoiceItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SalesInvoiceId { get; set; }

    [Required]
    public int PartId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; } // Price at time of sale

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostPrice { get; set; } // Cost price for COGS calculation

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; } // Quantity * UnitPrice

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(SalesInvoiceId))]
    public virtual SalesInvoice SalesInvoice { get; set; } = null!;

    [ForeignKey(nameof(PartId))]
    public virtual Part Part { get; set; } = null!;
}
