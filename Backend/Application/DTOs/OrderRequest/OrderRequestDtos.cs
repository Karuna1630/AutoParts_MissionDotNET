using System;
using System.Collections.Generic;

namespace Application.DTOs.OrderRequest;

public class OrderRequestDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderRequestItemDto> Items { get; set; } = new();
}

public class OrderRequestItemDto
{
    public int Id { get; set; }
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceAtRequest { get; set; }
}

public class CreateOrderRequestDto
{
    public string? Notes { get; set; }
    public List<CreateOrderRequestItemDto> Items { get; set; } = new();
}

public class CreateOrderRequestItemDto
{
    public int PartId { get; set; }
    public int Quantity { get; set; }
}
