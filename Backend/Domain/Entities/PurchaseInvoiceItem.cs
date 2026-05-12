using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("PurchaseInvoiceItems")]
public class PurchaseInvoiceItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int PurchaseInvoiceId { get; set; }

    [ForeignKey(nameof(PurchaseInvoiceId))]
    public PurchaseInvoice? PurchaseInvoice { get; set; }

    [Required]
    public int PartId { get; set; }

    [ForeignKey(nameof(PartId))]
    public Part? Part { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }
}
