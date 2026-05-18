using System.Threading.Tasks;

namespace Application.Interfaces.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null);
}
