using Application.Interfaces.Repositories;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace WebAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PurchaseInvoiceController : ControllerBase
{
    private readonly IPurchaseInvoiceRepository _invoiceRepository;

    public PurchaseInvoiceController(IPurchaseInvoiceRepository invoiceRepository)
    {
        _invoiceRepository = invoiceRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices = await _invoiceRepository.GetAllAsync();
        return Ok(new { success = true, data = invoices });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null) return NotFound();
        return Ok(new { success = true, data = invoice });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PurchaseInvoice invoice)
    {
        invoice.CreatedAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoiceRepository.AddAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();
        return Ok(new { success = true, data = invoice });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PurchaseInvoice updatedInvoice)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        invoice.InvoiceNo = updatedInvoice.InvoiceNo;
        invoice.VendorName = updatedInvoice.VendorName;
        invoice.Date = updatedInvoice.Date;
        invoice.DueDate = updatedInvoice.DueDate;
        invoice.TotalAmount = updatedInvoice.TotalAmount;
        invoice.Status = updatedInvoice.Status;
        invoice.UpdatedAt = DateTime.UtcNow;

        _invoiceRepository.Update(invoice);
        await _invoiceRepository.SaveChangesAsync();

        return Ok(new { success = true, data = invoice });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null) return NotFound();

        _invoiceRepository.Delete(invoice);
        await _invoiceRepository.SaveChangesAsync();

        return Ok(new { success = true, message = "Invoice deleted successfully" });
    }
}
