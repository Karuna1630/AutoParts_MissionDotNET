using Application.Interfaces.Repositories;
using Domain.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[Authorize(Roles = UserRoles.Admin)]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryRepository _inventoryRepository;

    public InventoryController(IInventoryRepository inventoryRepository)
    {
        _inventoryRepository = inventoryRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryRepository.GetAllAsync();
        return Ok(new { success = true, data = items });
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] InventoryItem item)
    {
        if (item == null) return BadRequest();
        
        await _inventoryRepository.AddAsync(item);
        await _inventoryRepository.SaveChangesAsync();
        
        return Ok(new { success = true, data = item });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _inventoryRepository.GetByIdAsync(id);
        if (item == null) return NotFound();
        
        _inventoryRepository.Remove(item);
        await _inventoryRepository.SaveChangesAsync();
        
        return Ok(new { success = true, message = "Item deleted successfully" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] InventoryItem updatedItem)
    {
        var item = await _inventoryRepository.GetByIdAsync(id);
        if (item == null) return NotFound();

        item.SKU = updatedItem.SKU;
        item.Name = updatedItem.Name;
        item.Category = updatedItem.Category;
        item.Price = updatedItem.Price;
        item.Stock = updatedItem.Stock;
        item.UpdatedAt = DateTime.UtcNow;

        _inventoryRepository.Update(item);
        await _inventoryRepository.SaveChangesAsync();

        return Ok(new { success = true, data = item });
    }
}
