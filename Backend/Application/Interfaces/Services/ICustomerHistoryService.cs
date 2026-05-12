using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Customer;

namespace Application.Interfaces.Services;

public interface ICustomerHistoryService
{
    Task<OperationResult<List<PurchaseHistoryDto>>> GetPurchaseHistoryAsync(int customerId, int? vehicleId, DateTime? fromDate, DateTime? toDate, string? status);
    Task<OperationResult<List<ServiceHistoryDto>>> GetServiceHistoryAsync(int customerId, int? vehicleId, string? status);
    Task<OperationResult<CombinedHistoryDto>> GetCombinedHistoryAsync(int customerId);
    Task<OperationResult<PurchaseHistoryDto>> GetSinglePurchaseAsync(int customerId, int invoiceId);
    Task<OperationResult<ServiceHistoryDto>> GetSingleServiceAsync(int customerId, int appointmentId);
    Task<OperationResult<HistorySummaryDto>> GetHistorySummaryAsync(int customerId);
    Task<OperationResult<byte[]>> ExportHistoryAsPdfAsync(int customerId);
    Task<OperationResult<byte[]>> DownloadSingleInvoicePdfAsync(int customerId, int invoiceId);
}
