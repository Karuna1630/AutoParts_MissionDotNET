using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Infrastructure.Repositories;

public class PurchaseInvoiceRepository : IPurchaseInvoiceRepository
{
    private readonly AppDbContext _context;

    public PurchaseInvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PurchaseInvoice>> GetAllAsync()
    {
        return await _context.PurchaseInvoices.ToListAsync();
    }

    public async Task<PurchaseInvoice?> GetByIdAsync(int id)
    {
        return await _context.PurchaseInvoices.FindAsync(id);
    }

    public async Task AddAsync(PurchaseInvoice invoice)
    {
        await _context.PurchaseInvoices.AddAsync(invoice);
    }

    public void Update(PurchaseInvoice invoice)
    {
        _context.PurchaseInvoices.Update(invoice);
    }

    public void Delete(PurchaseInvoice invoice)
    {
        _context.PurchaseInvoices.Remove(invoice);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
