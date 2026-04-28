using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Report;
using Application.Interfaces.Services;

namespace Application.Services;

public class ReportService : IReportService
{
    public Task<OperationResult<FinancialReportDto>> GenerateDailyReportAsync(DateTime date)
    {
        return Task.FromResult(OperationResult<FinancialReportDto>.Ok(GenerateMockData("Daily", date, 7)));
    }

    public Task<OperationResult<FinancialReportDto>> GenerateMonthlyReportAsync(int year, int month)
    {
        return Task.FromResult(OperationResult<FinancialReportDto>.Ok(GenerateMockData("Monthly", new DateTime(year, month, 1), 6)));
    }

    public Task<OperationResult<FinancialReportDto>> GenerateYearlyReportAsync(int year)
    {
        return Task.FromResult(OperationResult<FinancialReportDto>.Ok(GenerateMockData("Yearly", new DateTime(year, 1, 1), 12)));
    }

    private FinancialReportDto GenerateMockData(string type, DateTime date, int dataPoints)
    {
        var random = new Random((int)date.Ticks); // Seed to keep it consistent
        var multiplier = type == "Yearly" ? 30 : type == "Monthly" ? 1 : 0.1m;

        var totalRevenue = Math.Round((decimal)random.Next(5000, 20000) * multiplier, 2);
        var cogs = Math.Round(totalRevenue * (decimal)(random.NextDouble() * 0.2 + 0.4), 2); // COGS is 40-60% of revenue
        var expenses = Math.Round(totalRevenue * 0.15m, 2);
        var grossProfit = totalRevenue - cogs;
        var profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        var report = new FinancialReportDto
        {
            ReportType = type,
            ReportDate = date,
            Revenue = new RevenueMetrics
            {
                TotalSalesRevenue = totalRevenue,
                TotalCashSales = Math.Round(totalRevenue * 0.7m, 2),
                TotalCreditSales = Math.Round(totalRevenue * 0.3m, 2),
                AverageOrderValue = Math.Round(150m + (decimal)random.NextDouble() * 100, 2)
            },
            Costs = new CostMetrics
            {
                TotalCogs = cogs,
                TotalPurchaseCost = Math.Round(cogs * 1.1m, 2)
            },
            Profit = new ProfitMetrics
            {
                GrossProfit = grossProfit,
                GrossProfitMarginPercentage = Math.Round(profitMargin, 2)
            },
            Transactions = new TransactionMetrics
            {
                TotalSalesInvoices = (int)(random.Next(20, 100) * multiplier),
                TotalCustomersServed = (int)(random.Next(15, 80) * multiplier),
                TotalPartsSold = (int)(random.Next(50, 300) * multiplier)
            },
            Credit = new CreditMetrics
            {
                TotalOutstandingCreditBalance = Math.Round(totalRevenue * 0.1m, 2),
                CustomersWithOverdueCredit = random.Next(1, 10)
            },
            Inventory = new InventoryMetrics
            {
                LowStockPartsCount = random.Next(5, 25),
                TotalInventoryValue = Math.Round(cogs * 5, 2) // Inventory value usually high
            },
            TopPerformers = new TopPerformers
            {
                TopSellingParts = new List<TopPart>
                {
                    new() { PartName = "Brake Pads Set", QuantitySold = random.Next(10, 50), RevenueGenerated = 1200 },
                    new() { PartName = "Oil Filter", QuantitySold = random.Next(20, 100), RevenueGenerated = 800 },
                    new() { PartName = "Spark Plugs (4-pack)", QuantitySold = random.Next(15, 60), RevenueGenerated = 600 },
                    new() { PartName = "Car Battery 12V", QuantitySold = random.Next(5, 20), RevenueGenerated = 900 },
                    new() { PartName = "Air Filter", QuantitySold = random.Next(10, 40), RevenueGenerated = 400 }
                },
                TopCustomers = new List<TopCustomer>
                {
                    new() { CustomerName = "John Doe", TotalSpent = 1500 },
                    new() { CustomerName = "Sarah Smith", TotalSpent = 1200 },
                    new() { CustomerName = "Mike Johnson", TotalSpent = 950 },
                    new() { CustomerName = "Emily Davis", TotalSpent = 800 },
                    new() { CustomerName = "Robert Wilson", TotalSpent = 600 }
                }
            }
        };

        // Generate Chart Data
        report.ChartData = new List<ChartDataPoint>();
        for (int i = 1; i <= dataPoints; i++)
        {
            string label = type switch
            {
                "Yearly" => new DateTime(date.Year, i, 1).ToString("MMM"),
                "Monthly" => $"Day {i * 5}",
                "Daily" => date.AddDays(-dataPoints + i).ToString("ddd, MMM dd"),
                _ => $"{(i - 1) * 4:D2}:00"
            };

            var pointRev = Math.Round((totalRevenue / dataPoints) * (decimal)(0.5 + random.NextDouble()), 2);
            var pointExp = Math.Round((cogs / dataPoints) * (decimal)(0.8 + random.NextDouble() * 0.4), 2);
            
            report.ChartData.Add(new ChartDataPoint
            {
                Label = label,
                Revenue = pointRev,
                Expenses = pointExp,
                Profit = pointRev - pointExp
            });
        }

        return report;
    }
}
