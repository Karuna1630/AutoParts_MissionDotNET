using Application.Common;
using Application.DTOs.Sales;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services;

public class SalesService : ISalesService
{
    private readonly IGenericRepository<SalesInvoice> _invoiceRepo;
    private readonly IGenericRepository<Part> _partRepo;
    private readonly IGenericRepository<Customer> _customerRepo;
    private readonly IGenericRepository<Vehicle> _vehicleRepo;

    public SalesService(
        IGenericRepository<SalesInvoice> invoiceRepo,
        IGenericRepository<Part> partRepo,
        IGenericRepository<Customer> customerRepo,
        IGenericRepository<Vehicle> vehicleRepo)
    {
        _invoiceRepo = invoiceRepo;
        _partRepo = partRepo;
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
    }

    public async Task<OperationResult<ViewSalesInvoiceDto>> CreateInvoiceAsync(CreateSalesInvoiceDto dto, int staffId)
    {
        var customer = await _customerRepo.GetByIdAsync(dto.CustomerId);
        if (customer == null) return OperationResult<ViewSalesInvoiceDto>.Fail("Customer not found.");

        var invoice = new SalesInvoice
        {
            InvoiceNumber = await GenerateInvoiceNumberAsync(),
            CustomerId = dto.CustomerId,
            VehicleId = dto.VehicleId,
            StaffId = staffId,
            InvoiceDate = DateTime.UtcNow,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = dto.PaymentStatus,
            AmountPaid = dto.AmountPaid,
            Notes = dto.Notes,
            Items = new List<SalesInvoiceItem>()
        };

        decimal subtotal = 0;

        foreach (var itemDto in dto.Items)
        {
            var part = await _partRepo.GetByIdAsync(itemDto.PartId);
            if (part == null) return OperationResult<ViewSalesInvoiceDto>.Fail($"Part with ID {itemDto.PartId} not found.");
            
            if (part.StockQuantity < itemDto.Quantity)
                return OperationResult<ViewSalesInvoiceDto>.Fail($"Insufficient stock for part {part.Name}. Available: {part.StockQuantity}");

            var itemSubtotal = part.Price * itemDto.Quantity;
            subtotal += itemSubtotal;

            invoice.Items.Add(new SalesInvoiceItem
            {
                PartId = part.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = part.Price,
                CostPrice = part.CostPrice,
                Subtotal = itemSubtotal
            });

            // Deduct stock
            part.StockQuantity -= itemDto.Quantity;
            _partRepo.Update(part);
        }

        invoice.Subtotal = subtotal;

        // Loyalty Discount (Feature 16): 10% if > 5000
        if (subtotal > 5000)
        {
            invoice.DiscountAmount = subtotal * 0.10m;
            invoice.IsLoyaltyDiscountApplied = true;
        }

        invoice.FinalAmount = invoice.Subtotal - invoice.DiscountAmount;
        invoice.CreditAmount = Math.Max(0, invoice.FinalAmount - invoice.AmountPaid);

        // Update Customer Credit Balance if applicable
        if (invoice.CreditAmount > 0)
        {
            customer.CreditBalance += invoice.CreditAmount;
            _customerRepo.Update(customer);
        }

        await _invoiceRepo.AddAsync(invoice);
        await _invoiceRepo.SaveChangesAsync();

        return OperationResult<ViewSalesInvoiceDto>.Ok(MapToViewDto(invoice), "Invoice created successfully.");
    }

    public async Task<OperationResult<ViewSalesInvoiceDto>> GetInvoiceByIdAsync(int id)
    {
        var invoice = await _invoiceRepo.Query()
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff)
            .Include(i => i.Vehicle)
            .Include(i => i.Items).ThenInclude(it => it.Part)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null) return OperationResult<ViewSalesInvoiceDto>.Fail("Invoice not found.");

        return OperationResult<ViewSalesInvoiceDto>.Ok(MapToViewDto(invoice));
    }

    public async Task<OperationResult<List<ViewSalesInvoiceDto>>> GetAllInvoicesAsync()
    {
        var invoices = await _invoiceRepo.Query()
            .Include(i => i.Customer).ThenInclude(c => c.User)
            .Include(i => i.Staff)
            .Include(i => i.Items).ThenInclude(item => item.Part)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();

        return OperationResult<List<ViewSalesInvoiceDto>>.Ok(invoices.Select(MapToViewDto).ToList());
    }

    public async Task<OperationResult<bool>> UpdatePaymentStatusAsync(int id, string status, decimal amountPaid)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id);
        if (invoice == null) return OperationResult<bool>.Fail("Invoice not found.");

        var customer = await _customerRepo.GetByIdAsync(invoice.CustomerId);

        if (amountPaid > 0)
        {
            invoice.AmountPaid += amountPaid;
            invoice.CreditAmount = Math.Max(0, invoice.FinalAmount - invoice.AmountPaid);
            
            if (customer != null)
            {
                customer.CreditBalance -= amountPaid;
                _customerRepo.Update(customer);
            }
        }

        invoice.PaymentStatus = status;
        _invoiceRepo.Update(invoice);
        await _invoiceRepo.SaveChangesAsync();

        return OperationResult<bool>.Ok(true, "Payment status updated.");
    }

    public async Task<List<Part>> SearchPartsAsync(string query)
    {
        var queryable = _partRepo.Query();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lowerQuery = query.ToLower();
            queryable = queryable.Where(p => p.Name.ToLower().Contains(lowerQuery) || p.SKU.ToLower().Contains(lowerQuery));
        }

        return await queryable
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<List<Customer>> SearchCustomersAsync(string query)
    {
        var lowerQuery = query.ToLower();
        return await _customerRepo.Query()
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Where(c => c.User.FullName.ToLower().Contains(lowerQuery) || 
                        c.User.Phone.ToLower().Contains(lowerQuery) || 
                        c.User.Email.ToLower().Contains(lowerQuery))
            .Take(10)
            .ToListAsync();
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var count = await _invoiceRepo.Query()
            .CountAsync(i => i.InvoiceNumber.StartsWith($"INV-{today}"));
        
        return $"INV-{today}-{(count + 1):D4}";
    }

    private ViewSalesInvoiceDto MapToViewDto(SalesInvoice invoice)
    {
        return new ViewSalesInvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer?.User?.FullName ?? "Unknown",
            VehicleId = invoice.VehicleId,
            VehicleInfo = invoice.Vehicle != null ? $"{invoice.Vehicle.VehicleMake} {invoice.Vehicle.VehicleModel} ({invoice.Vehicle.VehicleNumber})" : null,
            StaffId = invoice.StaffId,
            StaffName = invoice.Staff?.FullName ?? "Unknown",
            InvoiceDate = invoice.InvoiceDate,
            Subtotal = invoice.Subtotal,
            DiscountAmount = invoice.DiscountAmount,
            FinalAmount = invoice.FinalAmount,
            TaxAmount = invoice.TaxAmount,
            PaymentStatus = invoice.PaymentStatus,
            PaymentMethod = invoice.PaymentMethod,
            AmountPaid = invoice.AmountPaid,
            CreditAmount = invoice.CreditAmount,
            IsLoyaltyDiscountApplied = invoice.IsLoyaltyDiscountApplied,
            Notes = invoice.Notes,
            Items = invoice.Items?.Select(it => new ViewSalesInvoiceItemDto
            {
                Id = it.Id,
                PartId = it.PartId,
                PartName = it.Part?.Name ?? "Unknown",
                SKU = it.Part?.SKU ?? "N/A",
                Quantity = it.Quantity,
                UnitPrice = it.UnitPrice,
                Subtotal = it.Subtotal
            }).ToList() ?? new List<ViewSalesInvoiceItemDto>()
        };
    }
}
