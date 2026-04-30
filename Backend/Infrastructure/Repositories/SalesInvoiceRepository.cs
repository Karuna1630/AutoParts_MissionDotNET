using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SalesInvoiceRepository : ISalesInvoiceRepository
{
    private readonly AppDbContext _context;

    public SalesInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SalesInvoice>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SalesInvoices
            .Include(i => i.Items)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<SalesInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.SalesInvoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task CreateInvoiceAsync(SalesInvoice invoice, IEnumerable<SalesInvoiceItem> items, IEnumerable<InventoryItem> inventoryItems, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        invoice.Items = items.ToList();
        await _context.SalesInvoices.AddAsync(invoice, cancellationToken);
        _context.InventoryItems.UpdateRange(inventoryItems);

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }
}
