using Application.DTOs.Sales;
using Application.Interfaces.Services;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Infrastructure.Services;

public class PdfService : IPdfService
{
    public PdfService()
    {
        // QuestPDF requires a license setup for production, but Community is free for many use cases.
        // We set it to Community to avoid runtime errors.
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(ViewSalesInvoiceDto invoice)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("AUTO PARTS MISSION").FontSize(22).SemiBold().FontColor(Colors.Blue.Medium);
                        col.Item().Text("Your Trusted Partner for Quality Parts").FontSize(9);
                    });

                    row.RelativeItem().AlignRight().Column(col =>
                    {
                        col.Item().Text($"INVOICE: {invoice.InvoiceNumber}").FontSize(14).SemiBold();
                        col.Item().Text($"Date: {invoice.InvoiceDate:MMM dd, yyyy}").FontSize(9);
                    });
                });

                page.Content().PaddingVertical(20).Column(col =>
                {
                    // Billing Info
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("BILL TO:").FontSize(9).SemiBold();
                            c.Item().Text(invoice.CustomerName ?? "Customer");
                            c.Item().Text(invoice.CustomerEmail ?? "").FontSize(9);
                        });
                        
                        row.RelativeItem().AlignRight().Column(c =>
                        {
                            c.Item().Text("PAYMENT INFO:").FontSize(9).SemiBold();
                            c.Item().Text($"Status: {invoice.PaymentStatus}").FontSize(9);
                            c.Item().Text($"Method: {invoice.PaymentMethod}").FontSize(9);
                        });
                    });

                    col.Item().PaddingTop(25).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(20);  // #
                            columns.RelativeColumn(5);   // Item
                            columns.RelativeColumn(1);   // Qty
                            columns.RelativeColumn(2);   // Price
                            columns.RelativeColumn(2);   // Total
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("#");
                            header.Cell().Element(CellStyle).Text("Item");
                            header.Cell().Element(CellStyle).AlignCenter().Text("Qty");
                            header.Cell().Element(CellStyle).AlignRight().Text("Price");
                            header.Cell().Element(CellStyle).AlignRight().Text("Total");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold().FontSize(9)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            }
                        });

                        int i = 1;
                        foreach (var item in invoice.Items)
                        {
                            table.Cell().Element(ItemCellStyle).Text(i++.ToString());
                            table.Cell().Element(ItemCellStyle).Text(item.PartName);
                            table.Cell().Element(ItemCellStyle).AlignCenter().Text(item.Quantity.ToString());
                            table.Cell().Element(ItemCellStyle).AlignRight().Text($"Rs.{item.UnitPrice:N2}");
                            table.Cell().Element(ItemCellStyle).AlignRight().Text($"Rs.{item.Subtotal:N2}");

                            static IContainer ItemCellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.FontSize(9)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                            }
                        }
                    });

                    // Totals
                    col.Item().AlignRight().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.ConstantColumn(100);
                        });

                        table.Cell().AlignRight().Text("Subtotal:").SemiBold();
                        table.Cell().AlignRight().Text($"Rs.{invoice.Subtotal:N2}");

                        if (invoice.DiscountAmount > 0)
                        {
                            table.Cell().AlignRight().Text("Discount:");
                            table.Cell().AlignRight().Text($"-Rs.{invoice.DiscountAmount:N2}");
                        }

                        table.Cell().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(6).AlignRight().Text("Final Amount:").SemiBold();
                        table.Cell().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(6).AlignRight().Text($"Rs.{invoice.FinalAmount:N2}").SemiBold();
                    });
                });

                page.Footer().AlignCenter().Column(c =>
                {
                    c.Item().Text("Thank you for your business!").Italic();
                    c.Item().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
