using System.Threading.Tasks;
using Application.DTOs.Report;

namespace Application.Interfaces.Services;

public interface IPdfReportService
{
    byte[] GenerateFinancialReportPdf(FinancialReportDto report, string title);
}
