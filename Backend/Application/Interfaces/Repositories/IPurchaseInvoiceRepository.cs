using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories;

public interface IPurchaseInvoiceRepository
{
    Task<IEnumerable<PurchaseInvoice>> GetAllAsync();
    Task<PurchaseInvoice?> GetByIdAsync(int id);
    Task AddAsync(PurchaseInvoice invoice);
    void Update(PurchaseInvoice invoice);
    void Delete(PurchaseInvoice invoice);
    Task<int> SaveChangesAsync();
}
