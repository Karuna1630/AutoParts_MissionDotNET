using System;
using System.Collections.Generic;

namespace Application.DTOs.Sales;

public class ViewSalesInvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int? VehicleId { get; set; }
    public string? VehicleInfo { get; set; }
    public int StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal AmountPaid { get; set; }
    public decimal CreditAmount { get; set; }
    public bool IsLoyaltyDiscountApplied { get; set; }
    public string? Notes { get; set; }
    public List<ViewSalesInvoiceItemDto> Items { get; set; } = new();
}

public class ViewSalesInvoiceItemDto
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
