using Domain.Entities;

namespace Application.Interfaces.Security;

public interface ITokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user);
}
