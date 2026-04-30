using Domain.Entities;

namespace Application.Interfaces.Security;

public interface ITokenService
{
    /// <summary>
    /// Generate a JWT for a domain User entity (Customer / legacy Admin).
    /// NameIdentifier claim = integer User.Id as string.
    /// </summary>
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user);

    /// <summary>
    /// Generate a JWT for an Identity-based user (Staff / Admin with UserProfile).
    /// NameIdentifier claim = identityId (Guid) so profile endpoints can resolve the user.
    /// </summary>
    (string Token, DateTime ExpiresAtUtc) GenerateToken(
        string email,
        string role,
        string identityId,
        string fullName);
}
