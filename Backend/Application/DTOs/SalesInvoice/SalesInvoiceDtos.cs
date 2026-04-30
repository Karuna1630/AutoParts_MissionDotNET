using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.SalesInvoice;

public class CreateSalesInvoiceItemDto
{
    [Required]
    public int InventoryItemId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
}

public class CreateSalesInvoiceDto
{
    [Required]
    public int CustomerId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal PaidAmount { get; set; }

    [Required]
    public List<CreateSalesInvoiceItemDto> Items { get; set; } = new();
}

public class SalesInvoiceItemResponseDto
{
    public int InventoryItemId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class SalesInvoiceResponseDto
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public List<SalesInvoiceItemResponseDto> Items { get; set; } = new();
}
