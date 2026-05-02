using System;

namespace Domain.Entities;

public class PurchaseInvoice
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Paid, Pending, Overdue
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
