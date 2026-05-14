using Application.Common;
using Application.DTOs.PurchaseInvoice;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly IGenericRepository<PurchaseInvoice> _invoiceRepository;
    private readonly IGenericRepository<Vendor> _vendorRepository;
    private readonly IGenericRepository<Part> _partRepository;
    private readonly ILogger<PurchaseInvoiceService> _logger;

    public PurchaseInvoiceService(
        IGenericRepository<PurchaseInvoice> invoiceRepository,
        IGenericRepository<Vendor> vendorRepository,
        IGenericRepository<Part> partRepository,
        ILogger<PurchaseInvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository;
        _vendorRepository = vendorRepository;
        _partRepository = partRepository;
        _logger = logger;
    }

    public async Task<OperationResult<PurchaseInvoiceResponseDto>> CreatePurchaseInvoiceAsync(CreatePurchaseInvoiceDto dto, int adminId)
    {
        try
        {
            // 1. Validate Vendor
            var vendor = await _vendorRepository.GetByIdAsync(dto.VendorId);
            if (vendor == null) return OperationResult<PurchaseInvoiceResponseDto>.Fail("Vendor not found.");

            // 2. Generate Invoice Number: PUR-YYYYMMDD-XXXX
            string datePart = DateTime.UtcNow.ToString("yyyyMMdd");
            var todayInvoicesCount = (await _invoiceRepository.FindAsync(i => i.InvoiceNumber.Contains($"PUR-{datePart}"))).Count();
            string invoiceNumber = $"PUR-{datePart}-{(todayInvoicesCount + 1):D4}";

            var invoice = new PurchaseInvoice
            {
                InvoiceNumber = invoiceNumber,
                VendorId = dto.VendorId,
                Vendor = vendor,
                InvoiceDate = DateTime.UtcNow,
                CreatedByAdminId = adminId,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            // 3. Process Items
            foreach (var itemDto in dto.Items)
            {
                var part = await _partRepository.GetByIdAsync(itemDto.PartId);
                if (part == null) return OperationResult<PurchaseInvoiceResponseDto>.Fail($"Part with ID {itemDto.PartId} not found.");

                var subtotal = itemDto.Quantity * itemDto.UnitPrice;
                totalAmount += subtotal;

                var invoiceItem = new PurchaseInvoiceItem
                {
                    PartId = itemDto.PartId,
                    Part = part,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    Subtotal = subtotal
                };

                invoice.Items.Add(invoiceItem);

                // 4. Update Stock Quantity and latest purchase cost
                part.StockQuantity += itemDto.Quantity;
                part.CostPrice = itemDto.UnitPrice;
                _partRepository.Update(part);
            }

            invoice.TotalAmount = totalAmount;

            // 5. Save all changes (Atomically handled by EF Core SaveChanges)
            await _invoiceRepository.AddAsync(invoice);
            await _invoiceRepository.SaveChangesAsync();

            _logger.LogInformation("Purchase Invoice {InvoiceNumber} created by Admin {AdminId}", invoice.InvoiceNumber, adminId);

            return OperationResult<PurchaseInvoiceResponseDto>.Ok(MapToResponse(invoice), "Purchase invoice created and stock updated successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating purchase invoice");
            return OperationResult<PurchaseInvoiceResponseDto>.Fail("An error occurred while creating the purchase invoice.");
        }
    }

    public async Task<OperationResult<PurchaseInvoiceResponseDto>> GetPurchaseInvoiceByIdAsync(int id)
    {
        var invoice = await _invoiceRepository.GetByIdWithIncludeAsync(id, i => i.Vendor!, i => i.Items);
        if (invoice == null) return OperationResult<PurchaseInvoiceResponseDto>.Fail("Purchase invoice not found.");

        // Load parts for the items
        var partIds = invoice.Items.Select(i => i.PartId).ToList();
        var parts = (await _partRepository.FindAsync(p => partIds.Contains(p.Id))).ToDictionary(p => p.Id);
        
        foreach(var item in invoice.Items)
        {
            if (parts.TryGetValue(item.PartId, out var part))
                item.Part = part;
        }
        
        return OperationResult<PurchaseInvoiceResponseDto>.Ok(MapToResponse(invoice));
    }

    public async Task<OperationResult<List<PurchaseInvoiceResponseDto>>> GetAllPurchaseInvoicesAsync(int pageNumber, int pageSize)
    {
        var invoices = await _invoiceRepository.GetAllWithIncludeAsync(null, i => i.Vendor!, i => i.Items);
        
        // Efficiently load parts for all invoices
        var allPartIds = invoices.SelectMany(i => i.Items).Select(item => item.PartId).Distinct().ToList();
        var parts = (await _partRepository.FindAsync(p => allPartIds.Contains(p.Id))).ToDictionary(p => p.Id);

        foreach (var invoice in invoices)
        {
            foreach (var item in invoice.Items)
            {
                if (parts.TryGetValue(item.PartId, out var part))
                    item.Part = part;
            }
        }

        var result = invoices
            .OrderByDescending(i => i.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse)
            .ToList();

        return OperationResult<List<PurchaseInvoiceResponseDto>>.Ok(result);
    }

    private PurchaseInvoiceResponseDto MapToResponse(PurchaseInvoice invoice)
    {
        return new PurchaseInvoiceResponseDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            VendorName = invoice.Vendor?.CompanyName ?? "Unknown",
            InvoiceDate = invoice.InvoiceDate,
            TotalAmount = invoice.TotalAmount,
            Notes = invoice.Notes,
            Items = invoice.Items.Select(item => new PurchaseInvoiceItemResponseDto
            {
                PartId = item.PartId,
                PartName = item.Part?.Name ?? "Unknown Part",
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Subtotal = item.Subtotal
            }).ToList()
        };
    }
}
