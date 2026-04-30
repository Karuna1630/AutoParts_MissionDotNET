using Application.DTOs.SalesInvoice;

namespace Application.Interfaces.Services;

public interface ISalesInvoiceService
{
    Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, Guid? staffId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SalesInvoiceResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}
