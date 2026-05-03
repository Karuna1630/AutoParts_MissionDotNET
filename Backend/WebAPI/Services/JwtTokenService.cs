using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.DTOs;
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
            new(ClaimTypes.Role, NormalizeRole(user.Role))
        };

        return CreateToken(claims);
    }

    public (string Token, DateTime ExpiresAtUtc) GenerateStaffToken(ViewStaffDto user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.IdentityId.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Name, user.DisplayName),
            new(ClaimTypes.NameIdentifier, user.IdentityId.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName),
            new(ClaimTypes.Role, NormalizeRole(user.UserRole.ToString()))
        };

        return CreateToken(claims);
    }

    private (string Token, DateTime ExpiresAtUtc) CreateToken(List<Claim> claims)
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

        var expiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var parsedMinutes)
            ? parsedMinutes
            : 120;

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes);

        claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));

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

    /// <summary>
    /// Normalizes role strings to PascalCase (e.g. "STAFF" → "Staff")
    /// to match the UserRoles constants used in [Authorize] attributes.
    /// </summary>
    private static string NormalizeRole(string role)
    {
        if (string.IsNullOrWhiteSpace(role)) return role;
        return char.ToUpperInvariant(role[0]) + role[1..].ToLowerInvariant();
    }
}
