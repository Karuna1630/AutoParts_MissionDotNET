using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Interfaces.Security;
using Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace WebAPI.Services;

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generates a JWT for a domain User entity (Customer / legacy Admin).
    /// NameIdentifier = integer User.Id as string.
    /// </summary>
    public (string Token, DateTime ExpiresAtUtc) GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        return BuildToken(claims);
    }

    /// <summary>
    /// Generates a JWT for an Identity-based user (Staff / Admin).
    /// NameIdentifier = identityId (Guid string) so profile endpoints can resolve the user.
    /// </summary>
    public (string Token, DateTime ExpiresAtUtc) GenerateToken(
        string email,
        string role,
        string identityId,
        string fullName)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, identityId),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Name, fullName),
            new(ClaimTypes.NameIdentifier, identityId),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, fullName),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        return BuildToken(claims);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private (string Token, DateTime ExpiresAtUtc) BuildToken(IEnumerable<Claim> claims)
    {
        var (key, issuer, audience, expiryMinutes) = GetJwtConfig();
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: signingCredentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAtUtc);
    }

    private (string Key, string Issuer, string Audience, int ExpiryMinutes) GetJwtConfig()
    {
        var key = _configuration["JWT_KEY"]
            ?? _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing in configuration.");

        var issuer = _configuration["JWT_ISSUER"]
            ?? _configuration["Jwt:Issuer"]
            ?? "VehiclePartsAPI";

        var audience = _configuration["JWT_AUDIENCE"]
            ?? _configuration["Jwt:Audience"]
            ?? "VehiclePartsClients";

        var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var parsed)
            ? parsed
            : 120;

        return (key, issuer, audience, expiryMinutes);
    }
}
