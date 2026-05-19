using Application.DTOs.Report;
using Application.Interfaces.Services;
using System.Globalization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Application.Services;

/// <summary>
/// Generates PDF reports.
/// </summary>
public class PdfReportService : IPdfReportService
{
    private static readonly CultureInfo ReportCulture = CultureInfo.InvariantCulture;

    public PdfReportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    /// <summary>
    /// Generates a financial report PDF document.
    /// </summary>
    public byte[] GenerateFinancialReportPdf(FinancialReportDto report, string title)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.1f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Verdana));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("AutoParts System").FontSize(19).SemiBold().FontColor(Colors.Blue.Medium);
                        col.Item().Text("Financial Performance Report").FontSize(13).Medium();
                    });

                    row.RelativeItem().AlignRight().Column(col =>
                    {
                        col.Item().Text(title).FontSize(11).SemiBold();
                        col.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });

                page.Content().PaddingVertical(20).Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                            c.Item().Text("TOTAL REVENUE").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                            c.Item().Text(Money(report.Revenue.TotalSalesRevenue)).FontSize(13).Bold();
                        });
                        row.ConstantItem(10);
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                            c.Item().Text("GROSS PROFIT").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                            c.Item().Text(Money(report.Profit.GrossProfit)).FontSize(13).Bold().FontColor(Colors.Green.Medium);
                        });
                        row.ConstantItem(10);
                        row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                            c.Item().Text("PROFIT MARGIN").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                            c.Item().Text($"{report.Profit.GrossProfitMarginPercentage}%").FontSize(14).Bold();
                        });
                    });

                    col.Item().PaddingVertical(20).LineHorizontal(1).LineColor(Colors.Grey.Lighten4);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.ConstantColumn(120);
                            columns.RelativeColumn();
                            columns.ConstantColumn(120);
                        });

                        table.Cell().ColumnSpan(2).Element(SectionHeaderStyle).Text("Revenue Breakdown");
                        table.Cell().ColumnSpan(2).Element(SectionHeaderStyle).Text("Inventory & Credit");

                        AddMetricRow(table, "Cash Sales", Money(report.Revenue.TotalCashSales), "Inventory Value", Money(report.Inventory.TotalInventoryValue));
                        AddMetricRow(table, "Credit Sales", Money(report.Revenue.TotalCreditSales), "Low Stock Items", report.Inventory.LowStockPartsCount.ToString(ReportCulture));
                        AddMetricRow(table, "Total Invoices", report.Transactions.TotalSalesInvoices.ToString(ReportCulture), "Outstanding Credit", Money(report.Credit.TotalOutstandingCreditBalance));

                        static IContainer SectionHeaderStyle(IContainer container) => container.PaddingBottom(6).DefaultTextStyle(x => x.FontSize(11).SemiBold());
                    });

                    col.Item().PaddingTop(25).Column(c => {
                        c.Item().PaddingBottom(5).Text("Top Selling Parts").FontSize(11).SemiBold();
                        c.Item().Table(table => {
                            table.ColumnsDefinition(columns => {
                                columns.ConstantColumn(25);
                                columns.RelativeColumn();
                                columns.ConstantColumn(55);
                                columns.ConstantColumn(140);
                            });

                            table.Header(header => {
                                header.Cell().Element(CellStyle).Text("#");
                                header.Cell().Element(CellStyle).Text("Part Name");
                                header.Cell().Element(CellStyle).AlignCenter().Text("Qty");
                                header.Cell().Element(CellStyle).AlignRight().Text("Revenue");

                                static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.SemiBold().FontSize(8.5f)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            int i = 1;
                            foreach (var part in report.TopPerformers.TopSellingParts) {
                                table.Cell().Element(ItemStyle).Text(i++.ToString(ReportCulture));
                                table.Cell().Element(ItemStyle).Text(part.PartName);
                                table.Cell().Element(ItemStyle).AlignCenter().Text(part.QuantitySold.ToString(ReportCulture));
                                table.Cell().Element(ItemStyle).AlignRight().Text(Money(part.RevenueGenerated));

                                static IContainer ItemStyle(IContainer container) => container.DefaultTextStyle(x => x.FontSize(8.5f)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten4);
                            }
                        });
                    });

                    col.Item().PaddingTop(25).Column(c => {
                        c.Item().PaddingBottom(5).Text("Top Customers").FontSize(11).SemiBold();
                        c.Item().Table(table => {
                            table.ColumnsDefinition(columns => {
                                columns.RelativeColumn();
                                columns.ConstantColumn(60);
                                columns.ConstantColumn(140);
                            });

                            table.Header(header => {
                                header.Cell().Element(CellStyle).Text("Customer Name");
                                header.Cell().Element(CellStyle).AlignCenter().Text("Orders");
                                header.Cell().Element(CellStyle).AlignRight().Text("Total Spent");

                                static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.SemiBold().FontSize(8.5f)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            foreach (var cust in report.TopPerformers.TopCustomers) {
                                table.Cell().Element(ItemStyle).Text(cust.CustomerName);
                                table.Cell().Element(ItemStyle).AlignCenter().Text(cust.OrderCount.ToString(ReportCulture));
                                table.Cell().Element(ItemStyle).AlignRight().Text(Money(cust.TotalSpent));

                                static IContainer ItemStyle(IContainer container) => container.DefaultTextStyle(x => x.FontSize(8.5f)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten4);
                            }
                        });
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private static string Money(decimal amount) => $"Rs. {amount.ToString("N0", ReportCulture)}";

    private static void AddMetricRow(TableDescriptor table, string leftLabel, string leftValue, string rightLabel, string rightValue)
    {
        table.Cell().Element(MetricLabelStyle).Text(leftLabel);
        table.Cell().Element(MetricValueStyle).Text(leftValue);
        table.Cell().Element(MetricLabelStyle).PaddingLeft(35).Text(rightLabel);
        table.Cell().Element(MetricValueStyle).Text(rightValue);

        static IContainer MetricLabelStyle(IContainer container) => container.PaddingVertical(2).DefaultTextStyle(x => x.FontSize(9));
        static IContainer MetricValueStyle(IContainer container) => container.PaddingVertical(2).AlignRight().DefaultTextStyle(x => x.FontSize(9));
    }
}
