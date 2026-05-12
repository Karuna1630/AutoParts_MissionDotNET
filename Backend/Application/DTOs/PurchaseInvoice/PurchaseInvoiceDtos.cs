using System;
using System.Collections.Generic;

namespace Application.DTOs.PurchaseInvoice;

public class CreatePurchaseInvoiceDto
{
    public int VendorId { get; set; }
    public List<PurchaseItemDto> Items { get; set; } = new();
    public string? Notes { get; set; }
}

public class PurchaseItemDto
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class PurchaseInvoiceResponseDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public List<PurchaseInvoiceItemResponseDto> Items { get; set; } = new();
}

public class PurchaseInvoiceItemResponseDto
{
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
