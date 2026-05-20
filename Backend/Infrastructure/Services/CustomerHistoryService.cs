using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Customer;
using Application.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Infrastructure.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    private readonly AppDbContext _context;

    static CustomerHistoryService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public CustomerHistoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OperationResult<List<PurchaseHistoryDto>>> GetPurchaseHistoryAsync(int customerId, int? vehicleId, DateTime? fromDate, DateTime? toDate, string? status)
    {
        try
        {
            var query = _context.SalesInvoices
                .Include(i => i.Items)
                .ThenInclude(item => item.Part)
                .Where(i => i.CustomerId == customerId);

            if (vehicleId.HasValue)
                query = query.Where(i => i.VehicleId == vehicleId.Value);

            if (fromDate.HasValue)
                query = query.Where(i => i.InvoiceDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(i => i.InvoiceDate <= toDate.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(i => i.PaymentStatus == status);

            var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();

            var result = invoices.Select(i => new PurchaseHistoryDto
            {
                InvoiceId = i.Id,
                InvoiceDate = i.InvoiceDate,
                TotalAmount = i.Subtotal,
                DiscountAmount = i.DiscountAmount,
                FinalAmount = i.FinalAmount,
                PaymentStatus = i.PaymentStatus,
                VehicleId = i.VehicleId,
                Items = i.Items.Select(item => new PurchaseItemDto
                {
                    PartName = item.Part.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                }).ToList()
            }).ToList();

            return OperationResult<List<PurchaseHistoryDto>>.Ok(result);
        }
        catch (Exception ex)
        {
            return OperationResult<List<PurchaseHistoryDto>>.Fail($"Error fetching purchase history: {ex.Message}");
        }
    }

    public async Task<OperationResult<List<ServiceHistoryDto>>> GetServiceHistoryAsync(int customerId, int? vehicleId, string? status)
    {
        try
        {
            var query = _context.ServiceAppointments
                .Include(a => a.Review)
                .Include(a => a.Vehicle)
                .Where(a => a.CustomerId == customerId);

            if (vehicleId.HasValue)
                query = query.Where(a => a.VehicleId == vehicleId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            var appointments = await query.OrderByDescending(a => a.PreferredDate).ToListAsync();

            var result = appointments.Select(a => new ServiceHistoryDto
            {
                AppointmentId = a.Id,
                AppointmentDate = a.PreferredDate,
                ServiceType = a.ServiceType,
                Status = a.Status,
                Notes = a.Notes ?? string.Empty,
                Rating = a.Review?.Rating,
                VehicleName = a.Vehicle != null
                    ? $"{a.Vehicle.VehicleMake} {a.Vehicle.VehicleModel} ({a.Vehicle.VehicleNumber})"
                    : "Unknown Vehicle",
                VehicleId = a.VehicleId
            }).ToList();

            return OperationResult<List<ServiceHistoryDto>>.Ok(result);
        }
        catch (Exception ex)
        {
            return OperationResult<List<ServiceHistoryDto>>.Fail($"Error fetching service history: {ex.Message}");
        }
    }

    public async Task<OperationResult<CombinedHistoryDto>> GetCombinedHistoryAsync(int customerId)
    {
        var purchasesResult = await GetPurchaseHistoryAsync(customerId, null, null, null, null);
        var servicesResult = await GetServiceHistoryAsync(customerId, null, null);

        if (!purchasesResult.Success || !servicesResult.Success)
            return OperationResult<CombinedHistoryDto>.Fail("Error fetching combined history.");

        var result = new CombinedHistoryDto
        {
            Purchases = purchasesResult.Data ?? new List<PurchaseHistoryDto>(),
            Services = servicesResult.Data ?? new List<ServiceHistoryDto>(),
            TotalPurchases = (purchasesResult.Data ?? new List<PurchaseHistoryDto>()).Count,
            TotalServices = (servicesResult.Data ?? new List<ServiceHistoryDto>()).Count
        };

        return OperationResult<CombinedHistoryDto>.Ok(result);
    }

    public async Task<OperationResult<PurchaseHistoryDto>> GetSinglePurchaseAsync(int customerId, int invoiceId)
    {
        var result = await GetPurchaseHistoryAsync(customerId, null, null, null, null);
        if (!result.Success || result.Data == null) return OperationResult<PurchaseHistoryDto>.Fail(result.Message);

        var purchase = result.Data.FirstOrDefault(p => p.InvoiceId == invoiceId);
        if (purchase == null) return OperationResult<PurchaseHistoryDto>.Fail("Invoice not found.");

        return OperationResult<PurchaseHistoryDto>.Ok(purchase);
    }

    public async Task<OperationResult<ServiceHistoryDto>> GetSingleServiceAsync(int customerId, int appointmentId)
    {
        var result = await GetServiceHistoryAsync(customerId, null, null);
        if (!result.Success || result.Data == null) return OperationResult<ServiceHistoryDto>.Fail(result.Message);

        var service = result.Data.FirstOrDefault(s => s.AppointmentId == appointmentId);
        if (service == null) return OperationResult<ServiceHistoryDto>.Fail("Appointment not found.");

        return OperationResult<ServiceHistoryDto>.Ok(service);
    }

    public async Task<OperationResult<HistorySummaryDto>> GetHistorySummaryAsync(int customerId)
    {
        try
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
            var summary = new HistorySummaryDto
            {
                TotalInvoices = await _context.SalesInvoices.CountAsync(i => i.CustomerId == customerId),
                TotalSpent = await _context.SalesInvoices.Where(i => i.CustomerId == customerId).SumAsync(i => i.FinalAmount),
                TotalAppointments = await _context.ServiceAppointments.CountAsync(a => a.CustomerId == customerId),
                CompletedAppointments = await _context.ServiceAppointments.CountAsync(a => a.CustomerId == customerId && a.Status == "Completed"),
                CreditBalance = customer?.CreditBalance ?? 0
            };

            return OperationResult<HistorySummaryDto>.Ok(summary);
        }
        catch (Exception ex)
        {
            return OperationResult<HistorySummaryDto>.Fail($"Error generating history summary: {ex.Message}");
        }
    }

    public async Task<OperationResult<byte[]>> ExportHistoryAsPdfAsync(int customerId)
    {
        try
        {
            var customer = await _context.Customers
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == customerId);
            
            if (customer == null) return OperationResult<byte[]>.Fail("Customer not found.");

            var summaryRes = await GetHistorySummaryAsync(customerId);
            var historyRes = await GetCombinedHistoryAsync(customerId);

            if (!summaryRes.Success || !historyRes.Success)
                return OperationResult<byte[]>.Fail("Error fetching data for PDF.");

            var summary = summaryRes.Data!;
            var history = historyRes.Data!;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(2.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Verdana));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("AutoParts Activity Summary").FontSize(19).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text($"Generated on: {DateTime.Now:MMMM dd, yyyy}").FontSize(10).FontColor(Colors.Grey.Medium);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text(customer.User.FullName).FontSize(14).SemiBold();
                            col.Item().Text(customer.User.Email).FontSize(10);
                            col.Item().Text(customer.User.Phone).FontSize(10);
                        });
                    });

                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        // Summary Cards
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                                c.Item().Text("TOTAL SPENT").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text($"Rs. {summary.TotalSpent:N2}").FontSize(16).Bold();
                            });
                            row.ConstantItem(15);
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                                c.Item().Text("INVOICES").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(summary.TotalInvoices.ToString()).FontSize(16).Bold();
                            });
                            row.ConstantItem(15);
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c => {
                                c.Item().Text("APPOINTMENTS").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(summary.TotalAppointments.ToString()).FontSize(16).Bold();
                            });
                        });

                        // Purchases Table
                        col.Item().PaddingTop(25).PaddingBottom(5).Text("Recent Purchases").FontSize(11).SemiBold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(80);
                                columns.ConstantColumn(80);
                                columns.RelativeColumn();
                                columns.ConstantColumn(100);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("Date");
                                header.Cell().Element(HeaderStyle).Text("Invoice");
                                header.Cell().Element(HeaderStyle).Text("Items");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Amount");

                                static IContainer HeaderStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Black).PaddingVertical(5).DefaultTextStyle(x => x.SemiBold().FontSize(8.5f));
                            });

                            foreach (var p in history.Purchases.Take(15))
                            {
                                table.Cell().Element(CellStyle).Text(p.InvoiceDate.ToString("MM/dd/yyyy"));
                                table.Cell().Element(CellStyle).Text($"INV-{p.InvoiceId}");
                                table.Cell().Element(CellStyle).Text(string.Join(", ", p.Items.Select(i => i.PartName)));
                                table.Cell().Element(CellStyle).AlignRight().Text($"Rs. {p.FinalAmount:N2}");

                                static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten4).PaddingVertical(5).DefaultTextStyle(x => x.FontSize(8.5f));
                            }
                        });

                        // Services Table
                        col.Item().PaddingTop(25).PaddingBottom(5).Text("Service History").FontSize(11).SemiBold();
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(80);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                                columns.ConstantColumn(80);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("Date");
                                header.Cell().Element(HeaderStyle).Text("Service");
                                header.Cell().Element(HeaderStyle).Text("Notes");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Status");

                                static IContainer HeaderStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Black).PaddingVertical(5).DefaultTextStyle(x => x.SemiBold().FontSize(8.5f));
                            });

                            foreach (var s in history.Services.Take(15))
                            {
                                table.Cell().Element(CellStyle).Text(s.AppointmentDate.ToString("MM/dd/yyyy"));
                                table.Cell().Element(CellStyle).Text(s.ServiceType);
                                table.Cell().Element(CellStyle).Text(s.Notes);
                                table.Cell().Element(CellStyle).AlignRight().Text(s.Status);

                                static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten4).PaddingVertical(5).DefaultTextStyle(x => x.FontSize(8.5f));
                            }
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

            var pdfBytes = document.GeneratePdf();
            return OperationResult<byte[]>.Ok(pdfBytes);
        }
        catch (Exception ex)
        {
            return OperationResult<byte[]>.Fail($"Error exporting PDF: {ex.Message}");
        }
    }

    public async Task<OperationResult<byte[]>> DownloadSingleInvoicePdfAsync(int customerId, int invoiceId)
    {
        try
        {
            var invoice = await _context.SalesInvoices
                .Include(i => i.Items)
                .ThenInclude(item => item.Part)
                .Include(i => i.Customer).ThenInclude(c => c.User)
                .Include(i => i.Staff)
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.CustomerId == customerId);

            if (invoice == null) return OperationResult<byte[]>.Fail("Invoice not found.");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(2.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Verdana));
                    
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("AutoParts MIS").FontSize(19).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text("Vehicle Parts & Services").FontSize(11).FontColor(Colors.Grey.Medium);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text("INVOICE").FontSize(20).SemiBold().FontColor(Colors.Grey.Darken3);
                            col.Item().Text($"#{invoice.InvoiceNumber}").FontSize(12);
                        });
                    });

                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c =>
                            {
                                c.Item().Text("BILL TO:").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(invoice.Customer.User.FullName).FontSize(12).SemiBold();
                                c.Item().Text(invoice.Customer.User.Email).FontSize(10);
                                c.Item().Text(invoice.Customer.User.Phone).FontSize(10);
                            });

                            row.ConstantItem(20);

                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten3).Padding(10).Column(c =>
                            {
                                c.Item().Text("INVOICE DATE").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(invoice.InvoiceDate.ToString("MMMM dd, yyyy")).FontSize(12).SemiBold();
                                c.Item().PaddingTop(5).Text("PAYMENT STATUS").FontSize(8).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(invoice.PaymentStatus).FontSize(12).SemiBold().FontColor(invoice.PaymentStatus == "Paid" ? Colors.Green.Medium : Colors.Orange.Medium);
                            });
                        });

                        col.Item().PaddingTop(30).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn();
                                columns.ConstantColumn(50);
                                columns.ConstantColumn(90);
                                columns.ConstantColumn(90);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("#");
                                header.Cell().Element(HeaderStyle).Text("Item / Description");
                                header.Cell().Element(HeaderStyle).AlignCenter().Text("Qty");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Price");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Total");

                                static IContainer HeaderStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Black).PaddingVertical(5).DefaultTextStyle(x => x.SemiBold().FontSize(8.5f));
                            });

                            int i = 1;
                            foreach (var item in invoice.Items)
                            {
                                table.Cell().Element(CellStyle).Text(i++.ToString());
                                table.Cell().Element(CellStyle).Text(item.Part.Name);
                                table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString());
                                table.Cell().Element(CellStyle).AlignRight().Text($"Rs. {item.UnitPrice:N2}");
                                table.Cell().Element(CellStyle).AlignRight().Text($"Rs. {item.Subtotal:N2}");

                                static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten4).PaddingVertical(6).DefaultTextStyle(x => x.FontSize(8.5f));
                            }
                        });

                        col.Item().AlignRight().PaddingTop(20).Column(c =>
                        {
                            c.Item().Row(row => {
                                row.RelativeItem().AlignRight().Text("Subtotal:").FontSize(11);
                                row.ConstantItem(120).AlignRight().Text($"Rs. {invoice.Subtotal:N2}").FontSize(11);
                            });

                            if (invoice.DiscountAmount > 0)
                            {
                                c.Item().Row(row => {
                                    row.RelativeItem().AlignRight().Text("Discount:").FontSize(11).FontColor(Colors.Green.Medium);
                                    row.ConstantItem(120).AlignRight().Text($"- Rs. {invoice.DiscountAmount:N2}").FontSize(11).FontColor(Colors.Green.Medium);
                                });
                            }

                            c.Item().Row(row => {
                                row.RelativeItem().AlignRight().Text("Grand Total:").FontSize(16).SemiBold();
                                row.ConstantItem(120).AlignRight().Text($"Rs. {invoice.FinalAmount:N2}").FontSize(16).SemiBold();
                            });
                        });

                        if (!string.IsNullOrEmpty(invoice.Notes))
                        {
                            col.Item().PaddingTop(40).Column(c =>
                            {
                                c.Item().Text("Notes & Instructions:").FontSize(10).SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(invoice.Notes).FontSize(10).Italic();
                            });
                        }
                    });

                    page.Footer().AlignCenter().Column(c =>
                    {
                        c.Item().Text("Thank you for choosing AutoParts MIS!").FontSize(10).SemiBold();
                        c.Item().Text("This is a computer-generated invoice.").FontSize(8).FontColor(Colors.Grey.Medium);
                    });
                });
            });

            var pdfBytes = document.GeneratePdf();
            return OperationResult<byte[]>.Ok(pdfBytes);
        }
        catch (Exception ex)
        {
            return OperationResult<byte[]>.Fail($"Error generating invoice PDF: {ex.Message}");
        }
    }
}
