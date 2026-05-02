using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Data;

namespace Infrastructure.Repositories;

public class InventoryRepository : GenericRepository<InventoryItem>, IInventoryRepository
{
    public InventoryRepository(AppDbContext context) : base(context)
    {
    }
}
