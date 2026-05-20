using Application.DTOs.Email;
using Application.Interfaces.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Services;

/// <summary>
/// Sends outbound email messages.
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Sends an email with an optional attachment.
    /// </summary>
    public async Task<bool> SendEmailAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null)
    {
        try
        {
            ValidateSettings();

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };

            if (attachment != null && !string.IsNullOrEmpty(attachmentName))
            {
                bodyBuilder.Attachments.Add(attachmentName, attachment);
            }

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            // Connect with appropriate security
            await client.ConnectAsync(_settings.SmtpServer, _settings.Port, _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);
            
            // Authenticate if needed
            if (!string.IsNullOrEmpty(_settings.Password))
            {
                await client.AuthenticateAsync(_settings.SenderEmail, _settings.Password);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Recipient}", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", to);
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }

    private void ValidateSettings()
    {
        if (string.IsNullOrWhiteSpace(_settings.SmtpServer))
            throw new InvalidOperationException("SMTP server is not configured.");

        if (_settings.Port <= 0)
            throw new InvalidOperationException("SMTP port is not configured.");

        if (string.IsNullOrWhiteSpace(_settings.SenderEmail))
            throw new InvalidOperationException("Sender email is not configured. Set SENDER_EMAIL in Backend/WebAPI/.env.");

        if (string.IsNullOrWhiteSpace(_settings.Password))
            throw new InvalidOperationException("SMTP password is not configured. Set SMTP_PASSWORD in Backend/WebAPI/.env.");
    }
}
