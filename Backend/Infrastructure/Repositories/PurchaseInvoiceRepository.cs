using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories;

/// <summary>
/// Provides purchase invoice data access.
/// </summary>
public class PurchaseInvoiceRepository : IPurchaseInvoiceRepository
{
    private readonly AppDbContext _context;

    public PurchaseInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns all purchase invoices.
    /// </summary>
    public async Task<IEnumerable<PurchaseInvoice>> GetAllAsync()
    {
        return await _context.PurchaseInvoices.ToListAsync();
    }

    /// <summary>
    /// Returns a purchase invoice by identifier.
    /// </summary>
    public async Task<PurchaseInvoice?> GetByIdAsync(int id)
    {
        return await _context.PurchaseInvoices.FindAsync(id);
    }

    /// <summary>
    /// Adds a purchase invoice.
    /// </summary>
    public async Task AddAsync(PurchaseInvoice invoice)
    {
        await _context.PurchaseInvoices.AddAsync(invoice);
    }

    /// <summary>
    /// Updates a purchase invoice.
    /// </summary>
    public void Update(PurchaseInvoice invoice)
    {
        _context.PurchaseInvoices.Update(invoice);
    }

    /// <summary>
    /// Deletes a purchase invoice.
    /// </summary>
    public void Delete(PurchaseInvoice invoice)
    {
        _context.PurchaseInvoices.Remove(invoice);
    }

    /// <summary>
    /// Saves pending changes.
    /// </summary>
    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
