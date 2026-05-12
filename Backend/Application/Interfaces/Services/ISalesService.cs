using Application.Common;
using Application.DTOs.Sales;
using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.Services;

public interface ISalesService
{
    Task<OperationResult<ViewSalesInvoiceDto>> CreateInvoiceAsync(CreateSalesInvoiceDto dto, int staffId);
    Task<OperationResult<ViewSalesInvoiceDto>> GetInvoiceByIdAsync(int id);
    Task<OperationResult<List<ViewSalesInvoiceDto>>> GetAllInvoicesAsync();
    Task<OperationResult<bool>> UpdatePaymentStatusAsync(int id, string status, decimal amountPaid);
    Task<List<Part>> SearchPartsAsync(string query);
    Task<List<Customer>> SearchCustomersAsync(string query);
}
