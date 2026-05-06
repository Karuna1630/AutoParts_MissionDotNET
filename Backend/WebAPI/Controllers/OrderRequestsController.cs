using Application.DTOs.OrderRequest;
using Application.Interfaces.Repositories;
using Domain.Constants;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrderRequestsController : ControllerBase
{
    private readonly IGenericRepository<OrderRequest> _orderRepo;
    private readonly IGenericRepository<Part> _partRepo;
    private readonly IGenericRepository<Customer> _customerRepo;
    private readonly IGenericRepository<SalesInvoice> _invoiceRepo;

    public OrderRequestsController(
        IGenericRepository<OrderRequest> orderRepo,
        IGenericRepository<Part> partRepo,
        IGenericRepository<Customer> customerRepo,
        IGenericRepository<SalesInvoice> invoiceRepo)
    {
        _orderRepo = orderRepo;
        _partRepo = partRepo;
        _customerRepo = customerRepo;
        _invoiceRepo = invoiceRepo;
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Customer)]
    public async Task<IActionResult> Create(CreateOrderRequestDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return Unauthorized(new { success = false, message = "Customer profile not found." });

        if (dto.Items == null || !dto.Items.Any())
            return BadRequest(new { success = false, message = "Cart cannot be empty." });

        var orderRequest = new OrderRequest
        {
            CustomerId = customer.Id,
            Notes = dto.Notes,
            Status = "Pending",
            TotalAmount = 0
        };

        foreach (var itemDto in dto.Items)
        {
            var part = await _partRepo.GetByIdAsync(itemDto.PartId);
            if (part == null) return BadRequest(new { success = false, message = $"Part ID {itemDto.PartId} not found." });
            
            if (part.StockQuantity < itemDto.Quantity)
                return BadRequest(new { success = false, message = $"Insufficient stock for {part.Name}. Available: {part.StockQuantity}" });

            var item = new OrderRequestItem
            {
                PartId = part.Id,
                Quantity = itemDto.Quantity,
                UnitPriceAtRequest = part.Price
            };
            orderRequest.Items.Add(item);
            orderRequest.TotalAmount += item.Quantity * item.UnitPriceAtRequest;
        }

        await _orderRepo.AddAsync(orderRequest);
        await _orderRepo.SaveChangesAsync();

        return Ok(new { success = true, data = orderRequest.Id, message = "Order request submitted successfully." });
    }

    [HttpGet("my-orders")]
    [Authorize(Roles = UserRoles.Customer)]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _customerRepo.Query().FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return Unauthorized(new { success = false, message = "Customer profile not found." });

        var orders = await _orderRepo.Query()
            .Include(o => o.Items).ThenInclude(i => i.Part)
            .Where(o => o.CustomerId == customer.Id)
            .OrderByDescending(o => o.RequestDate)
            .Select(o => new OrderRequestDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                RequestDate = o.RequestDate,
                Status = o.Status,
                Notes = o.Notes,
                TotalAmount = o.TotalAmount,
                Items = o.Items.Select(i => new OrderRequestItemDto
                {
                    Id = i.Id,
                    PartId = i.PartId,
                    PartName = i.Part.Name,
                    Sku = i.Part.SKU,
                    Quantity = i.Quantity,
                    UnitPriceAtRequest = i.UnitPriceAtRequest
                }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, data = orders });
    }

    [HttpGet("pending")]
    [Authorize(Roles = UserRoles.Admin + "," + UserRoles.Staff)]
    public async Task<IActionResult> GetPendingOrders()
    {
        var orders = await _orderRepo.Query()
            .Include(o => o.Customer).ThenInclude(c => c.User)
            .Include(o => o.Items).ThenInclude(i => i.Part)
            .Where(o => o.Status == "Pending")
            .OrderByDescending(o => o.RequestDate)
            .Select(o => new OrderRequestDto
            {
                Id = o.Id,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer.User.FullName,
                RequestDate = o.RequestDate,
                Status = o.Status,
                Notes = o.Notes,
                TotalAmount = o.TotalAmount,
                Items = o.Items.Select(i => new OrderRequestItemDto
                {
                    Id = i.Id,
                    PartId = i.PartId,
                    PartName = i.Part.Name,
                    Sku = i.Part.SKU,
                    Quantity = i.Quantity,
                    UnitPriceAtRequest = i.UnitPriceAtRequest
                }).ToList()
            })
            .ToListAsync();

        return Ok(new { success = true, data = orders });
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order == null) return NotFound(new { success = false, message = "Order not found." });
        
        if (order.Status != "Pending")
            return BadRequest(new { success = false, message = "Only pending orders can be cancelled." });

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;
        _orderRepo.Update(order);
        await _orderRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Order cancelled successfully." });
    }

    [HttpPost("{id}/create-invoice")]
    [Authorize(Roles = UserRoles.Admin + "," + UserRoles.Staff)]
    public async Task<IActionResult> CreateInvoice(int id)
    {
        var order = await _orderRepo.Query()
            .Include(o => o.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { success = false, message = "Order not found." });
        if (order.Status != "Pending") return BadRequest(new { success = false, message = "Invoice already created or order cancelled." });

        // Re-check stock for all items
        foreach (var item in order.Items)
        {
            if (item.Part.StockQuantity < item.Quantity)
                return BadRequest(new { success = false, message = $"Insufficient stock for {item.Part.Name}. Available: {item.Part.StockQuantity}" });
        }

        // Get Staff ID
        int staffId = 0;
        var staffClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(staffClaim, out staffId))
        {
            staffId = 1; 
        }

        var invoice = new SalesInvoice
        {
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
            CustomerId = order.CustomerId,
            StaffId = staffId,
            InvoiceDate = DateTime.UtcNow,
            Subtotal = order.TotalAmount,
            PaymentStatus = "Credit",
            PaymentMethod = "In-Store Pickup",
            Notes = $"Order Request #{order.Id}. {order.Notes}"
        };

        // Business Rule: 10% Loyalty Discount if Subtotal > 5000
        if (invoice.Subtotal > 5000)
        {
            invoice.DiscountAmount = invoice.Subtotal * 0.10m;
            invoice.IsLoyaltyDiscountApplied = true;
        }
        invoice.FinalAmount = invoice.Subtotal - invoice.DiscountAmount;

        // Deduct Stock and Add Invoice Items
        foreach (var item in order.Items)
        {
            invoice.Items.Add(new SalesInvoiceItem
            {
                PartId = item.PartId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPriceAtRequest,
                CostPrice = item.Part.CostPrice,
                Subtotal = item.Quantity * item.UnitPriceAtRequest
            });

            item.Part.StockQuantity -= item.Quantity;
            _partRepo.Update(item.Part);
        }

        // Update Order Request Status
        order.Status = "Reserved";
        order.UpdatedAt = DateTime.UtcNow;
        _orderRepo.Update(order);

        await _invoiceRepo.AddAsync(invoice);
        await _orderRepo.SaveChangesAsync();
        await _invoiceRepo.SaveChangesAsync();

        return Ok(new { 
            success = true, 
            message = "Invoice created and parts reserved successfully.",
            data = new { invoiceId = invoice.Id, invoiceNumber = invoice.InvoiceNumber }
        });
    }

    [HttpPatch("{id}/complete")]
    [Authorize(Roles = UserRoles.Admin + "," + UserRoles.Staff)]
    public async Task<IActionResult> CompleteOrder(int id)
    {
        var order = await _orderRepo.GetByIdAsync(id);
        if (order == null) return NotFound(new { success = false, message = "Order not found." });
        
        order.Status = "Completed";
        order.UpdatedAt = DateTime.UtcNow;
        _orderRepo.Update(order);
        await _orderRepo.SaveChangesAsync();

        return Ok(new { success = true, message = "Order marked as completed." });
    }
}
