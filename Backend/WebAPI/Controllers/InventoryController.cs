using Application.DTOs.Inventory;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
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
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;

    public InventoryController(IInventoryRepository inventoryRepository, IMapper mapper, IImageService imageService)
    {
        _inventoryRepository = inventoryRepository;
        _mapper = mapper;
        _imageService = imageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _inventoryRepository.GetAllAsync();
        return Ok(new { success = true, data = items });
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Add([FromForm] CreateInventoryItemDto dto)
    {
        if (dto == null) return BadRequest();
        
        var item = _mapper.Map<Part>(dto);
        
        if (dto.Image != null)
        {
            var imageUrl = await _imageService.UploadImageAsync(dto.Image, "inventory");
            if (!string.IsNullOrEmpty(imageUrl))
            {
                item.ImageUrl = imageUrl;
            }
        }
        
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
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateInventoryItemDto dto)
    {
        var item = await _inventoryRepository.GetByIdAsync(id);
        if (item == null) return NotFound();

        _mapper.Map(dto, item);

        if (dto.Image != null)
        {
            var imageUrl = await _imageService.UploadImageAsync(dto.Image, "inventory");
            if (!string.IsNullOrEmpty(imageUrl))
            {
                item.ImageUrl = imageUrl;
            }
        }

        item.UpdatedAt = DateTime.UtcNow;

        _inventoryRepository.Update(item);
        await _inventoryRepository.SaveChangesAsync();

        return Ok(new { success = true, data = item });
    }
}
