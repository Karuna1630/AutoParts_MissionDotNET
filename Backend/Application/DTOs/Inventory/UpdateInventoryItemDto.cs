using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Inventory;

public class UpdateInventoryItemDto
{
    public string? SKU { get; set; }
    public string? Name { get; set; }
    public string? Category { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative")]
    public int? StockQuantity { get; set; }

    public IFormFile? Image { get; set; }
}
