using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface ISalesInvoiceRepository
{
    Task<IEnumerable<SalesInvoice>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SalesInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task CreateInvoiceAsync(SalesInvoice invoice, IEnumerable<SalesInvoiceItem> items, IEnumerable<InventoryItem> inventoryItems, CancellationToken cancellationToken = default);
}
