using Application.DTOs.Sales;

namespace Application.Interfaces.Services;

public interface IPdfService
{
    byte[] GenerateInvoicePdf(ViewSalesInvoiceDto invoice);
}
