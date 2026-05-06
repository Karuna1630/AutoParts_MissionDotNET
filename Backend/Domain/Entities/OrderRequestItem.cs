using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("OrderRequestItems")]
public class OrderRequestItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrderRequestId { get; set; }

    [Required]
    public int PartId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPriceAtRequest { get; set; }

    // Navigation properties
    [ForeignKey(nameof(OrderRequestId))]
    public virtual OrderRequest OrderRequest { get; set; } = null!;

    [ForeignKey(nameof(PartId))]
    public virtual Part Part { get; set; } = null!;
}
