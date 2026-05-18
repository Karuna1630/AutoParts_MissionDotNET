using Application.Common;
using Application.DTOs.Report;
using Application.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OperationResult<FinancialReportDto>> GenerateDailyReportAsync(DateTime date)
    {
        var start = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var end = start.AddDays(1).AddTicks(-1);
        return OperationResult<FinancialReportDto>.Ok(await BuildSimpleReportAsync("Daily", start, end));
    }

    public async Task<OperationResult<FinancialReportDto>> GenerateMonthlyReportAsync(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1).AddTicks(-1);
        return OperationResult<FinancialReportDto>.Ok(await BuildSimpleReportAsync("Monthly", start, end));
    }

    public async Task<OperationResult<FinancialReportDto>> GenerateYearlyReportAsync(int year)
    {
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddYears(1).AddTicks(-1);
        return OperationResult<FinancialReportDto>.Ok(await BuildSimpleReportAsync("Yearly", start, end));
    }

    public async Task<OperationResult<FinancialReportDto>> GenerateRangeReportAsync(DateTime fromDate, DateTime toDate)
    {
        var start = DateTime.SpecifyKind(fromDate.Date, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(toDate.Date, DateTimeKind.Utc).AddDays(1).AddTicks(-1);
        return OperationResult<FinancialReportDto>.Ok(await BuildSimpleReportAsync("Custom Range", start, end));
    }

    private async Task<FinancialReportDto> BuildSimpleReportAsync(string type, DateTime start, DateTime end)
    {
        var invoices = await _context.SalesInvoices
            .AsNoTracking()
            .Include(i => i.Items).ThenInclude(item => item.Part)
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Where(i => i.InvoiceDate >= start && i.InvoiceDate <= end)
            .ToListAsync();

        var purchaseInvoices = await _context.PurchaseInvoices
            .AsNoTracking()
            .Where(i => i.InvoiceDate >= start && i.InvoiceDate <= end)
            .ToListAsync();

        var totalRevenue = invoices.Sum(i => i.FinalAmount);
        var cashSales = invoices
            .Where(i => i.PaymentStatus == "Paid")
            .Sum(i => i.FinalAmount);
        var creditSales = invoices
            .Where(i => i.PaymentStatus == "Credit" || i.PaymentStatus == "Partial")
            .Sum(i => i.FinalAmount);

        var totalCogs = invoices.SelectMany(i => i.Items).Sum(item => item.Quantity * item.CostPrice);
        var grossProfit = totalRevenue - totalCogs;
        var profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue * 100 : 0;

        var totalInvoices = invoices.Count;
        var customersCount = invoices.Select(i => i.CustomerId).Distinct().Count();
        var partsSold = invoices.SelectMany(i => i.Items).Sum(item => item.Quantity);

        var totalCredit = await _context.Customers.SumAsync(c => c.CreditBalance);
        var lowStockCount = await _context.Parts.CountAsync(p => p.StockQuantity > 0 && p.StockQuantity < 10);
        var inventoryValue = await _context.Parts
            .SumAsync(p => p.StockQuantity * (p.CostPrice > 0 ? p.CostPrice : p.Price));

        var topParts = invoices.SelectMany(i => i.Items)
            .GroupBy(item => item.PartId)
            .Select(g => new TopPart
            {
                PartName = g.First().Part?.Name ?? "Unknown Part",
                QuantitySold = g.Sum(x => x.Quantity),
                RevenueGenerated = g.Sum(x => x.Subtotal)
            })
            .OrderByDescending(p => p.QuantitySold)
            .Take(5)
            .ToList();

        var topCustomers = await _context.SalesInvoices
            .AsNoTracking()
            .Where(i => i.InvoiceDate >= start && i.InvoiceDate <= end)
            .GroupBy(i => new
            {
                i.CustomerId,
                CustomerName = i.Customer.User.FullName
            })
            .Select(g => new TopCustomer
            {
                CustomerName = g.Key.CustomerName,
                TotalSpent = g.Sum(i => i.FinalAmount),
                OrderCount = g.Count()
            })
            .OrderByDescending(c => c.TotalSpent)
            .ThenBy(c => c.CustomerName)
            .Take(5)
            .ToListAsync();

        return new FinancialReportDto
        {
            ReportType = type,
            ReportDate = start,
            Revenue = new RevenueMetrics
            {
                TotalSalesRevenue = totalRevenue,
                TotalCashSales = cashSales,
                TotalCreditSales = creditSales,
                AverageOrderValue = totalInvoices > 0 ? Math.Round(totalRevenue / totalInvoices, 2) : 0
            },
            Costs = new CostMetrics
            {
                TotalCogs = totalCogs,
                TotalPurchaseCost = purchaseInvoices.Sum(i => i.TotalAmount)
            },
            Profit = new ProfitMetrics
            {
                GrossProfit = grossProfit,
                GrossProfitMarginPercentage = Math.Round(profitMargin, 2)
            },
            Transactions = new TransactionMetrics
            {
                TotalSalesInvoices = totalInvoices,
                TotalCustomersServed = customersCount,
                TotalPartsSold = partsSold
            },
            Credit = new CreditMetrics
            {
                TotalOutstandingCreditBalance = totalCredit,
                CustomersWithOverdueCredit = await _context.Customers.CountAsync(c => c.CreditBalance > 0)
            },
            Inventory = new InventoryMetrics
            {
                LowStockPartsCount = lowStockCount,
                TotalInventoryValue = inventoryValue
            },
            TopPerformers = new TopPerformers
            {
                TopSellingParts = topParts,
                TopCustomers = topCustomers
            }
        };
    }
}
