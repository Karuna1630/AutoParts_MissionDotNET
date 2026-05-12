using Application.Common;
using Application.DTOs.PurchaseInvoice;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.Services;

public interface IPurchaseInvoiceService
{
    Task<OperationResult<PurchaseInvoiceResponseDto>> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceDto dto, int adminId);
    Task<OperationResult<PurchaseInvoiceResponseDto>> GetPurchaseInvoiceByIdAsync(int id);
    Task<OperationResult<List<PurchaseInvoiceResponseDto>>> GetAllPurchaseInvoicesAsync(int pageNumber, int pageSize);
}
