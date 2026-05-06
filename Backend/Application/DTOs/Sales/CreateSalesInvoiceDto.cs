using System;
using System.Collections.Generic;

namespace Application.DTOs.Sales;

public class CreateSalesInvoiceDto
{
    public int CustomerId { get; set; }
    public int? VehicleId { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, CreditCard, BankTransfer
    public string PaymentStatus { get; set; } = "Paid"; // Paid, Credit, Partial
    public decimal AmountPaid { get; set; }
    public string? Notes { get; set; }
    public List<CreateSalesInvoiceItemDto> Items { get; set; } = new();
}

public class CreateSalesInvoiceItemDto
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
}
