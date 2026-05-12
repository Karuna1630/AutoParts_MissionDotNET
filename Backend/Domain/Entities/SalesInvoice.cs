using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

[Table("SalesInvoices")]
public class SalesInvoice
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty; // INV-YYYYMMDD-XXXX

    [Required]
    public int CustomerId { get; set; }

    public int? VehicleId { get; set; } // Optional: which vehicle parts are for

    [Required]
    public int StaffId { get; set; } // Staff who created invoice

    [Required]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; } // Before discount

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalAmount { get; set; } // After discount

    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; } = 0; // Optional

    [Required]
    [MaxLength(20)]
    public string PaymentStatus { get; set; } = "Paid"; // Paid, Credit, Partial

    [MaxLength(20)]
    public string PaymentMethod { get; set; } = "Cash"; // Cash, CreditCard, BankTransfer

    [Column(TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; } = 0; // For Partial/Credit payments

    [Column(TypeName = "decimal(18,2)")]
    public decimal CreditAmount { get; set; } = 0; // Remaining credit balance for this invoice

    public bool IsLoyaltyDiscountApplied { get; set; } = false; // Track if 10% discount was given

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(CustomerId))]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey(nameof(VehicleId))]
    public virtual Vehicle? Vehicle { get; set; }

    [ForeignKey(nameof(StaffId))]
    public virtual User Staff { get; set; } = null!;

    public virtual ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
}
