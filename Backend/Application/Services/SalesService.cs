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

/// <summary>
/// Handles sales invoices and sales reporting.
/// </summary>
public class SalesService : ISalesService
{
    private readonly IGenericRepository<SalesInvoice> _invoiceRepo;
    private readonly IGenericRepository<Part> _partRepo;
    private readonly IGenericRepository<Customer> _customerRepo;
    private readonly IGenericRepository<Vehicle> _vehicleRepo;
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;

    public SalesService(
        IGenericRepository<SalesInvoice> invoiceRepo,
        IGenericRepository<Part> partRepo,
        IGenericRepository<Customer> customerRepo,
        IGenericRepository<Vehicle> vehicleRepo,
        IPdfService pdfService,
        IEmailService emailService,
        INotificationService notificationService)
    {
        _invoiceRepo = invoiceRepo;
        _partRepo = partRepo;
        _customerRepo = customerRepo;
        _vehicleRepo = vehicleRepo;
        _pdfService = pdfService;
        _emailService = emailService;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Creates a new sales invoice.
    /// </summary>
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

        // Check for low stock for each part in the invoice
        foreach (var item in invoice.Items)
        {
            await _notificationService.CheckAndNotifyLowStockAsync(item.PartId);
        }

        return OperationResult<ViewSalesInvoiceDto>.Ok(MapToViewDto(invoice), "Invoice created successfully.");
    }

    /// <summary>
    /// Returns a single invoice.
    /// </summary>
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

    /// <summary>
    /// Returns regular customers.
    /// </summary>
    public async Task<List<CustomerReportDto>> GetRegularCustomersAsync()
{
    return await _invoiceRepo.Query()
        .Include(i => i.Customer)
            .ThenInclude(c => c.User)
        .GroupBy(i => new
        {
            i.CustomerId,
            i.Customer.User.FullName,
            i.Customer.User.Email
        })
        .Where(g => g.Count() >= 3)
        .Select(g => new CustomerReportDto
        {
            CustomerId = g.Key.CustomerId,
            CustomerName = g.Key.FullName,
            CustomerEmail = g.Key.Email,
            TotalInvoices = g.Count(),
            TotalSpent = g.Sum(x => x.FinalAmount),
            PendingCredit = g.Sum(x => x.CreditAmount)
        })
        .OrderByDescending(x => x.TotalInvoices)
        .ToListAsync();
}

    /// <summary>
    /// Returns high-spending customers.
    /// </summary>
public async Task<List<CustomerReportDto>> GetHighSpendersAsync()
{
    return await _invoiceRepo.Query()
        .Include(i => i.Customer)
            .ThenInclude(c => c.User)
        .GroupBy(i => new
        {
            i.CustomerId,
            i.Customer.User.FullName,
            i.Customer.User.Email
        })
        .Select(g => new CustomerReportDto
        {
            CustomerId = g.Key.CustomerId,
            CustomerName = g.Key.FullName,
            CustomerEmail = g.Key.Email,
            TotalInvoices = g.Count(),
            TotalSpent = g.Sum(x => x.FinalAmount),
            PendingCredit = g.Sum(x => x.CreditAmount)
        })
        .Where(x => x.TotalSpent >= 5000)
        .OrderByDescending(x => x.TotalSpent)
        .ToListAsync();
}
    /// <summary>
    /// Returns customers with pending credits.
    /// </summary>
public async Task<List<CustomerReportDto>> GetPendingCreditsAsync()
{
    return await _invoiceRepo.Query()
        .Include(i => i.Customer)
            .ThenInclude(c => c.User)
        .Where(i => i.CreditAmount > 0)
        .GroupBy(i => new
        {
            i.CustomerId,
            i.Customer.User.FullName,
            i.Customer.User.Email
        })
        .Select(g => new CustomerReportDto
        {
            CustomerId = g.Key.CustomerId,
            CustomerName = g.Key.FullName,
            CustomerEmail = g.Key.Email,
            TotalInvoices = g.Count(),
            TotalSpent = g.Sum(x => x.FinalAmount),
            PendingCredit = g.Sum(x => x.CreditAmount)
        })
        .OrderByDescending(x => x.PendingCredit)
        .ToListAsync();
}
    /// <summary>
    /// Returns all sales invoices.
    /// </summary>
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

    /// <summary>
    /// Updates invoice payment status.
    /// </summary>
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

    /// <summary>
    /// Searches parts for POS and sales flows.
    /// </summary>
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

    /// <summary>
    /// Searches customers for POS and sales flows.
    /// </summary>
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

    /// <summary>
    /// Emails an invoice PDF to the customer.
    /// </summary>
    public async Task<OperationResult<string>> SendInvoiceEmailAsync(int id)
    {
        var invoiceResult = await GetInvoiceByIdAsync(id);
        if (!invoiceResult.Success) return OperationResult<string>.Fail(invoiceResult.Message);

        var invoiceDto = invoiceResult.Data!;
        var customerEmail = invoiceDto.CustomerEmail;

        if (string.IsNullOrWhiteSpace(customerEmail))
            return OperationResult<string>.Fail("Customer does not have a registered email address.");

        try
        {
            // 1. Generate PDF
            var pdfBytes = _pdfService.GenerateInvoicePdf(invoiceDto);

            // 2. Prepare Email Body
            string subject = $"Your Invoice {invoiceDto.InvoiceNumber} from Auto Parts Mission";
            string body = $@"
                <h3>Hello {invoiceDto.CustomerName},</h3>
                <p>Thank you for shopping with Auto Parts Mission. Your invoice <b>{invoiceDto.InvoiceNumber}</b> is ready.</p>
                <p><b>Summary:</b></p>
                <ul>
                    <li>Date: {invoiceDto.InvoiceDate:MMM dd, yyyy}</li>
                    <li>Total Amount: Rs.{invoiceDto.FinalAmount:N2}</li>
                    <li>Payment Status: {invoiceDto.PaymentStatus}</li>
                </ul>
                <p>Please find the detailed invoice attached as a PDF.</p>
                <p>Best regards,<br/>Auto Parts Mission Team</p>";

            // 3. Send Email
            bool sent = await _emailService.SendEmailAsync(customerEmail, subject, body, pdfBytes, $"{invoiceDto.InvoiceNumber}.pdf");

            if (sent)
                return OperationResult<string>.Ok("Invoice email sent successfully.");
            else
                return OperationResult<string>.Fail("Failed to send email. Please check SMTP configuration.");
        }
        catch (Exception ex)
        {
            return OperationResult<string>.Fail($"Error processing email: {ex.Message}");
        }
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
            CustomerEmail = invoice.Customer?.User?.Email,
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
