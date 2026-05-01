using Application.Common;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly AppDbContext _context;

    public VendorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Vendors.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByCompanyNameAsync(string companyName, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Vendors.AsQueryable().Where(x => x.CompanyName == companyName);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Vendors.AsQueryable().Where(x => x.Email == email);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<Vendor>> GetPagedAsync(int pageNumber, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Vendors.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = $"%{search.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.CompanyName, normalized)
                || EF.Functions.ILike(x.ContactName, normalized)
                || EF.Functions.ILike(x.Email, normalized));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Vendor>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task AddAsync(Vendor vendor, CancellationToken cancellationToken = default)
    {
        await _context.Vendors.AddAsync(vendor, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Vendor vendor, CancellationToken cancellationToken = default)
    {
        _context.Vendors.Update(vendor);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Vendor vendor, CancellationToken cancellationToken = default)
    {
        _context.Vendors.Remove(vendor);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
