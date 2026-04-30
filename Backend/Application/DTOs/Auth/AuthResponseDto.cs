namespace Application.DTOs.Auth;

public class AuthResponseDto
{
    public int UserId { get; set; }
    /// <summary>
    /// Populated only for Identity-based logins (Staff / Admin).
    /// Null for Customer logins that use the User entity path.
    /// </summary>
    public Guid? IdentityId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}
