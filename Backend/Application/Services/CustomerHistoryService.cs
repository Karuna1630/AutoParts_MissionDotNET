using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Customer;
using Application.Interfaces.Services;

namespace Application.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    // Generate some mock data for purchases
    private List<PurchaseHistoryDto> GenerateMockPurchases(int customerId)
    {
        var random = new Random(customerId);
        var purchases = new List<PurchaseHistoryDto>();
        
        for (int i = 1; i <= random.Next(3, 8); i++)
        {
            var items = new List<PurchaseItemDto>();
            int numItems = random.Next(1, 5);
            decimal total = 0;
            
            for (int j = 0; j < numItems; j++)
            {
                decimal price = random.Next(20, 200);
                int qty = random.Next(1, 4);
                total += price * qty;
                
                items.Add(new PurchaseItemDto
                {
                    PartName = $"Mock Part {random.Next(100, 999)}",
                    UnitPrice = price,
                    Quantity = qty
                });
            }

            purchases.Add(new PurchaseHistoryDto
            {
                InvoiceId = customerId * 1000 + i,
                InvoiceDate = DateTime.UtcNow.AddDays(-random.Next(5, 300)),
                TotalAmount = total,
                DiscountAmount = Math.Round(total * 0.1m, 2),
                FinalAmount = Math.Round(total * 0.9m, 2),
                PaymentStatus = random.Next(0, 5) == 0 ? "Credit" : "Paid",
                VehicleId = random.Next(0, 2) == 0 ? null : random.Next(1, 3),
                Items = items
            });
        }
        
        return purchases.OrderByDescending(p => p.InvoiceDate).ToList();
    }

    // Generate mock data for services
    private List<ServiceHistoryDto> GenerateMockServices(int customerId)
    {
        var random = new Random(customerId + 100);
        var services = new List<ServiceHistoryDto>();
        var types = new[] { "Oil Change", "Brake Inspection", "Full Service", "Tire Rotation" };
        var statuses = new[] { "Completed", "Completed", "Pending", "Cancelled" };
        
        for (int i = 1; i <= random.Next(2, 6); i++)
        {
            services.Add(new ServiceHistoryDto
            {
                AppointmentId = customerId * 1000 + i,
                AppointmentDate = DateTime.UtcNow.AddDays(-random.Next(-10, 200)),
                ServiceType = types[random.Next(types.Length)],
                Status = statuses[random.Next(statuses.Length)],
                Notes = "Standard maintenance procedure.",
                Rating = random.Next(0, 3) == 0 ? null : random.Next(4, 6),
                VehicleId = random.Next(1, 3)
            });
        }
        
        return services.OrderByDescending(s => s.AppointmentDate).ToList();
    }

    public Task<OperationResult<List<PurchaseHistoryDto>>> GetPurchaseHistoryAsync(int customerId, int? vehicleId, DateTime? fromDate, DateTime? toDate, string? status)
    {
        var purchases = GenerateMockPurchases(customerId);
        
        if (vehicleId.HasValue)
            purchases = purchases.Where(p => p.VehicleId == vehicleId).ToList();
            
        if (fromDate.HasValue)
            purchases = purchases.Where(p => p.InvoiceDate >= fromDate.Value).ToList();
            
        if (toDate.HasValue)
            purchases = purchases.Where(p => p.InvoiceDate <= toDate.Value).ToList();
            
        if (!string.IsNullOrEmpty(status))
            purchases = purchases.Where(p => p.PaymentStatus.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();

        return Task.FromResult(OperationResult<List<PurchaseHistoryDto>>.Ok(purchases));
    }

    public Task<OperationResult<List<ServiceHistoryDto>>> GetServiceHistoryAsync(int customerId, int? vehicleId, string? status)
    {
        var services = GenerateMockServices(customerId);
        
        if (vehicleId.HasValue)
            services = services.Where(s => s.VehicleId == vehicleId).ToList();
            
        if (!string.IsNullOrEmpty(status))
            services = services.Where(s => s.Status.Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();

        return Task.FromResult(OperationResult<List<ServiceHistoryDto>>.Ok(services));
    }

    public Task<OperationResult<CombinedHistoryDto>> GetCombinedHistoryAsync(int customerId)
    {
        var purchases = GenerateMockPurchases(customerId);
        var services = GenerateMockServices(customerId);

        var result = new CombinedHistoryDto
        {
            Purchases = purchases,
            Services = services,
            TotalPurchases = purchases.Count,
            TotalServices = services.Count
        };

        return Task.FromResult(OperationResult<CombinedHistoryDto>.Ok(result));
    }

    public Task<OperationResult<PurchaseHistoryDto>> GetSinglePurchaseAsync(int customerId, int invoiceId)
    {
        var purchase = GenerateMockPurchases(customerId).FirstOrDefault(p => p.InvoiceId == invoiceId);
        if (purchase == null)
            return Task.FromResult(OperationResult<PurchaseHistoryDto>.Fail("Invoice not found."));
            
        return Task.FromResult(OperationResult<PurchaseHistoryDto>.Ok(purchase));
    }

    public Task<OperationResult<ServiceHistoryDto>> GetSingleServiceAsync(int customerId, int appointmentId)
    {
        var service = GenerateMockServices(customerId).FirstOrDefault(s => s.AppointmentId == appointmentId);
        if (service == null)
            return Task.FromResult(OperationResult<ServiceHistoryDto>.Fail("Appointment not found."));
            
        return Task.FromResult(OperationResult<ServiceHistoryDto>.Ok(service));
    }

    public Task<OperationResult<HistorySummaryDto>> GetHistorySummaryAsync(int customerId)
    {
        var purchases = GenerateMockPurchases(customerId);
        var services = GenerateMockServices(customerId);

        var summary = new HistorySummaryDto
        {
            TotalInvoices = purchases.Count,
            TotalSpent = purchases.Sum(p => p.FinalAmount),
            TotalAppointments = services.Count,
            CompletedAppointments = services.Count(s => s.Status == "Completed")
        };

        return Task.FromResult(OperationResult<HistorySummaryDto>.Ok(summary));
    }

    public Task<OperationResult<byte[]>> ExportHistoryAsPdfAsync(int customerId)
    {
        // Mock PDF bytes
        var fakePdfBytes = System.Text.Encoding.UTF8.GetBytes("Fake PDF Content for Customer History");
        return Task.FromResult(OperationResult<byte[]>.Ok(fakePdfBytes));
    }

    public Task<OperationResult<byte[]>> DownloadSingleInvoicePdfAsync(int customerId, int invoiceId)
    {
        // Mock PDF bytes
        var fakePdfBytes = System.Text.Encoding.UTF8.GetBytes($"Fake PDF Content for Invoice {invoiceId}");
        return Task.FromResult(OperationResult<byte[]>.Ok(fakePdfBytes));
    }
}
