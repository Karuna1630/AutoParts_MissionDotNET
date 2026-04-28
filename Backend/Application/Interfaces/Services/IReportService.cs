using System.Threading.Tasks;
using Application.Common;
using Application.DTOs.Report;

namespace Application.Interfaces.Services;

public interface IReportService
{
    Task<OperationResult<FinancialReportDto>> GenerateDailyReportAsync(DateTime date);
    Task<OperationResult<FinancialReportDto>> GenerateMonthlyReportAsync(int year, int month);
    Task<OperationResult<FinancialReportDto>> GenerateYearlyReportAsync(int year);
}
