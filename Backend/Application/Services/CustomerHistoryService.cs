/*
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Customer;
using Application.Interfaces.Services;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Application.Services;

public class CustomerHistoryService : ICustomerHistoryService
{
    private readonly AppDbContext _context;

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
                    PartName = item.Part.PartName,
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
            Purchases = purchasesResult.data,
            Services = servicesResult.data,
            TotalPurchases = purchasesResult.data.Count,
            TotalServices = servicesResult.data.Count
        };

        return OperationResult<CombinedHistoryDto>.Ok(result);
    }

    public async Task<OperationResult<PurchaseHistoryDto>> GetSinglePurchaseAsync(int customerId, int invoiceId)
    {
        var result = await GetPurchaseHistoryAsync(customerId, null, null, null, null);
        if (!result.Success) return OperationResult<PurchaseHistoryDto>.Fail(result.Message);

        var purchase = result.data.FirstOrDefault(p => p.InvoiceId == invoiceId);
        if (purchase == null) return OperationResult<PurchaseHistoryDto>.Fail("Invoice not found.");

        return OperationResult<PurchaseHistoryDto>.Ok(purchase);
    }

    public async Task<OperationResult<ServiceHistoryDto>> GetSingleServiceAsync(int customerId, int appointmentId)
    {
        var result = await GetServiceHistoryAsync(customerId, null, null);
        if (!result.Success) return OperationResult<ServiceHistoryDto>.Fail(result.Message);

        var service = result.data.FirstOrDefault(s => s.AppointmentId == appointmentId);
        if (service == null) return OperationResult<ServiceHistoryDto>.Fail("Appointment not found.");

        return OperationResult<ServiceHistoryDto>.Ok(service);
    }

    public async Task<OperationResult<HistorySummaryDto>> GetHistorySummaryAsync(int customerId)
    {
        try
        {
            var summary = new HistorySummaryDto
            {
                TotalInvoices = await _context.SalesInvoices.CountAsync(i => i.CustomerId == customerId),
                TotalSpent = await _context.SalesInvoices.Where(i => i.CustomerId == customerId).SumAsync(i => i.FinalAmount),
                TotalAppointments = await _context.ServiceAppointments.CountAsync(a => a.CustomerId == customerId),
                CompletedAppointments = await _context.ServiceAppointments.CountAsync(a => a.CustomerId == customerId && a.Status == "Completed")
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
        // Placeholder for real PDF export logic
        var fakePdfBytes = System.Text.Encoding.UTF8.GetBytes("Real PDF Content logic will go here");
        return OperationResult<byte[]>.Ok(fakePdfBytes);
    }

    public async Task<OperationResult<byte[]>> DownloadSingleInvoicePdfAsync(int customerId, int invoiceId)
    {
        // Placeholder for real Invoice PDF logic
        var fakePdfBytes = System.Text.Encoding.UTF8.GetBytes($"Invoice PDF for #{invoiceId}");
        return OperationResult<byte[]>.Ok(fakePdfBytes);
    }
}
*/
