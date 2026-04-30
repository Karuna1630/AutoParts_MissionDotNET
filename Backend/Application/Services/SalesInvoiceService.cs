using Application.DTOs.SalesInvoice;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class SalesInvoiceService : ISalesInvoiceService
{
    private const decimal DiscountThreshold = 5000m;
    private const decimal DiscountRate = 0.10m;

    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUserRepository _userRepository;

    public SalesInvoiceService(
        ISalesInvoiceRepository salesInvoiceRepository,
        IInventoryRepository inventoryRepository,
        IUserRepository userRepository)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _inventoryRepository = inventoryRepository;
        _userRepository = userRepository;
    }

    public async Task<SalesInvoiceResponseDto> CreateAsync(CreateSalesInvoiceDto dto, Guid? staffId = null, CancellationToken cancellationToken = default)
    {
        if (dto.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one item is required.");
        }

        var customer = await _userRepository.GetByIdAsync(dto.CustomerId, cancellationToken);
        if (customer == null || customer.Role != UserRole.Customer.ToString())
        {
            throw new InvalidOperationException("Customer not found.");
        }

        var requestedItemIds = dto.Items.Select(i => i.InventoryItemId).Distinct().ToList();
        var inventoryItems = (await _inventoryRepository.FindAsync(i => requestedItemIds.Contains(i.Id))).ToList();

        if (inventoryItems.Count != requestedItemIds.Count)
        {
            throw new InvalidOperationException("One or more inventory items were not found.");
        }

        var itemMap = inventoryItems.ToDictionary(i => i.Id, i => i);
        var invoiceItems = new List<SalesInvoiceItem>();
        decimal subtotal = 0m;

        foreach (var requestItem in dto.Items)
        {
            if (!itemMap.TryGetValue(requestItem.InventoryItemId, out var inventoryItem))
            {
                throw new InvalidOperationException("Inventory item not found.");
            }

            if (requestItem.Quantity <= 0)
            {
                throw new InvalidOperationException("Quantity must be greater than zero.");
            }

            if (inventoryItem.Stock < requestItem.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock for {inventoryItem.Name}.");
            }

            var lineTotal = inventoryItem.Price * requestItem.Quantity;
            subtotal += lineTotal;

            invoiceItems.Add(new SalesInvoiceItem
            {
                InventoryItemId = inventoryItem.Id,
                PartName = inventoryItem.Name,
                UnitPrice = inventoryItem.Price,
                Quantity = requestItem.Quantity,
                LineTotal = lineTotal
            });

            inventoryItem.Stock -= requestItem.Quantity;
            inventoryItem.UpdatedAt = DateTime.UtcNow;
        }

        var discountAmount = subtotal > DiscountThreshold ? Math.Round(subtotal * DiscountRate, 2) : 0m;
        var totalAmount = subtotal - discountAmount;
        var paidAmount = Math.Min(dto.PaidAmount, totalAmount);
        var dueAmount = totalAmount - paidAmount;
        var paymentStatus = dueAmount == 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Due";

        var invoice = new SalesInvoice
        {
            InvoiceNo = $"SI-{DateTime.UtcNow:yyyyMMddHHmmss}",
            CustomerId = customer.Id,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            CustomerPhone = customer.Phone,
            InvoiceDate = DateTime.UtcNow,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            TotalAmount = totalAmount,
            PaidAmount = paidAmount,
            DueAmount = dueAmount,
            PaymentStatus = paymentStatus,
            CreatedByStaffId = staffId,
            CreatedAt = DateTime.UtcNow
        };

        await _salesInvoiceRepository.CreateInvoiceAsync(invoice, invoiceItems, inventoryItems, cancellationToken);

        return MapResponse(invoice, invoiceItems);
    }

    public async Task<IEnumerable<SalesInvoiceResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var invoices = await _salesInvoiceRepository.GetAllAsync(cancellationToken);
        return invoices.Select(invoice => MapResponse(invoice, invoice.Items));
    }

    public async Task<SalesInvoiceResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _salesInvoiceRepository.GetByIdAsync(id, cancellationToken);
        return invoice == null ? null : MapResponse(invoice, invoice.Items);
    }

    private static SalesInvoiceResponseDto MapResponse(SalesInvoice invoice, IEnumerable<SalesInvoiceItem> items)
    {
        return new SalesInvoiceResponseDto
        {
            Id = invoice.Id,
            InvoiceNo = invoice.InvoiceNo,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.CustomerName,
            CustomerEmail = invoice.CustomerEmail,
            CustomerPhone = invoice.CustomerPhone,
            InvoiceDate = invoice.InvoiceDate,
            Subtotal = invoice.Subtotal,
            DiscountAmount = invoice.DiscountAmount,
            TotalAmount = invoice.TotalAmount,
            PaidAmount = invoice.PaidAmount,
            DueAmount = invoice.DueAmount,
            PaymentStatus = invoice.PaymentStatus,
            Items = items.Select(item => new SalesInvoiceItemResponseDto
            {
                InventoryItemId = item.InventoryItemId,
                PartName = item.PartName,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}
