namespace Application.DTOs.Sales;

public class CustomerReportDto
{
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;

    public int TotalInvoices { get; set; }

    public decimal TotalSpent { get; set; }

    public decimal PendingCredit { get; set; }
}