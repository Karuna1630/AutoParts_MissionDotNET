using System;
using System.Collections.Generic;

namespace Application.DTOs.Report;

public class FinancialReportDto
{
    public string ReportType { get; set; } = string.Empty; // "Daily", "Monthly", "Yearly"
    public DateTime ReportDate { get; set; }
    
    public RevenueMetrics Revenue { get; set; } = new();
    public CostMetrics Costs { get; set; } = new();
    public ProfitMetrics Profit { get; set; } = new();
    public TransactionMetrics Transactions { get; set; } = new();
    public CreditMetrics Credit { get; set; } = new();
    public InventoryMetrics Inventory { get; set; } = new();
    public TopPerformers TopPerformers { get; set; } = new();

    // For charts
    public List<ChartDataPoint> ChartData { get; set; } = new();
}

public class RevenueMetrics
{
    public decimal TotalSalesRevenue { get; set; }
    public decimal TotalCashSales { get; set; }
    public decimal TotalCreditSales { get; set; }
    public decimal AverageOrderValue { get; set; }
}

public class CostMetrics
{
    public decimal TotalCogs { get; set; }
    public decimal TotalPurchaseCost { get; set; }
}

public class ProfitMetrics
{
    public decimal GrossProfit { get; set; }
    public decimal GrossProfitMarginPercentage { get; set; }
}

public class TransactionMetrics
{
    public int TotalSalesInvoices { get; set; }
    public int TotalCustomersServed { get; set; }
    public int TotalPartsSold { get; set; }
}

public class CreditMetrics
{
    public decimal TotalOutstandingCreditBalance { get; set; }
    public int CustomersWithOverdueCredit { get; set; }
}

public class InventoryMetrics
{
    public int LowStockPartsCount { get; set; }
    public decimal TotalInventoryValue { get; set; }
}

public class TopPerformers
{
    public List<TopPart> TopSellingParts { get; set; } = new();
    public List<TopCustomer> TopCustomers { get; set; } = new();
}

public class TopPart
{
    public string PartName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal RevenueGenerated { get; set; }
}

public class TopCustomer
{
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; }
}

public class ChartDataPoint
{
    public string Label { get; set; } = string.Empty; // e.g., "08:00", "Mon", "Jan"
    public decimal Revenue { get; set; }
    public decimal Expenses { get; set; }
    public decimal Profit { get; set; }
}
