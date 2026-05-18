using System.Threading.Tasks;

namespace Application.Interfaces.Services;

public interface INotificationService
{
    Task CheckAndNotifyLowStockAsync(int? partId = null);
    Task CheckAndSendCreditRemindersAsync();
    Task CreateDashboardNotificationAsync(int userId, string title, string message, string type = "Info", string? relatedId = null);
}
