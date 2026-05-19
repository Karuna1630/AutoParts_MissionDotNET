using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

/// <summary>
/// Provides user data access.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns a user by identifier.
    /// </summary>
    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    /// <summary>
    /// Returns a user by email address.
    /// </summary>
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    /// <summary>
    /// Checks whether a user exists with the given email.
    /// </summary>
    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers.AnyAsync(x => x.Email == email, cancellationToken);
    }

    /// <summary>
    /// Returns all users.
    /// </summary>
    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Returns users for a specific role.
    /// </summary>
    public async Task<List<User>> GetByRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers
            .Where(x => x.Role == role)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Counts users for a specific role.
    /// </summary>
    public async Task<int> CountByRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers.CountAsync(x => x.Role == role, cancellationToken);
    }

    /// <summary>
    /// Counts all users.
    /// </summary>
    public async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AppUsers.CountAsync(cancellationToken);
    }

    /// <summary>
    /// Adds a user.
    /// </summary>
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.AppUsers.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Updates a user.
    /// </summary>
    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.AppUsers.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Deletes a user.
    /// </summary>
    public async Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.AppUsers.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
