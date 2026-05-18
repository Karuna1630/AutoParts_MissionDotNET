using Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Services;

public class NotificationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24); // Run daily

    public NotificationBackgroundService(IServiceProvider serviceProvider, ILogger<NotificationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Background Service is starting.");

        // Initial delay to let the app start fully
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Notification Background Service is processing checks...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                    
                    await notificationService.CheckAndNotifyLowStockAsync();
                    await notificationService.CheckAndSendCreditRemindersAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing background notifications.");
            }

            _logger.LogInformation($"Notification Background Service is sleeping until tomorrow.");
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Notification Background Service is stopping.");
    }
}
