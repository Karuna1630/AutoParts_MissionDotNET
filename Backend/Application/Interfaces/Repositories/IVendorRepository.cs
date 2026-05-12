using Application.Common;
using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IVendorRepository
{
    Task<Vendor?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCompanyNameAsync(string companyName, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<PagedResult<Vendor>> GetPagedAsync(int pageNumber, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task AddAsync(Vendor vendor, CancellationToken cancellationToken = default);
    Task UpdateAsync(Vendor vendor, CancellationToken cancellationToken = default);
    Task DeleteAsync(Vendor vendor, CancellationToken cancellationToken = default);
}
