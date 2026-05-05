using System;
using System.Collections.Generic;

namespace Application.DTOs.Customer;

public class PurchaseHistoryDto
{
    public int InvoiceId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public int? VehicleId { get; set; }
    public List<PurchaseItemDto> Items { get; set; } = new();
}

public class PurchaseItemDto
{
    public string PartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class ServiceHistoryDto
{
    public int AppointmentId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public int? Rating { get; set; }
    public int? VehicleId { get; set; }
}

public class CombinedHistoryDto
{
    public List<PurchaseHistoryDto> Purchases { get; set; } = new();
    public List<ServiceHistoryDto> Services { get; set; } = new();
    public int TotalPurchases { get; set; }
    public int TotalServices { get; set; }
}

public class HistorySummaryDto
{
    public int TotalInvoices { get; set; }
    public decimal TotalSpent { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
}
