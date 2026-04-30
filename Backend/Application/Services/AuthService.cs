using Application.Common;
using Application.DTOs.Auth;
using Application.Interfaces.Repositories;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Domain.Constants;
using Domain.Entities;

namespace Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public Task<OperationResult<AuthResponseDto>> RegisterCustomerAsync(
        RegisterCustomerRequestDto request,
        CancellationToken cancellationToken = default)
    {
        return CreateUserAsync(
            request.Email,
            request.Password,
            request.FullName,
            request.Phone,
            UserRoles.Customer,
            "Customer registered successfully.",
            cancellationToken);
    }

    public Task<OperationResult<AuthResponseDto>> CreateStaffAsync(
        CreateStaffRequestDto request,
        CancellationToken cancellationToken = default)
    {
        return CreateUserAsync(
            request.Email,
            request.Password,
            request.FullName,
            request.Phone,
            UserRoles.Staff,
            "Staff account created successfully.",
            cancellationToken);
    }

    public async Task<OperationResult<AuthResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return OperationResult<AuthResponseDto>.Fail(
                "Validation failed.",
                "Email and password are required.");
        }

        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return OperationResult<AuthResponseDto>.Fail(
                "Authentication failed.",
                "Invalid email or password.");
        }

        return OperationResult<AuthResponseDto>.Ok(
            BuildAuthResponse(user),
            "Login successful.");
    }

    private async Task<OperationResult<AuthResponseDto>> CreateUserAsync(
        string email,
        string password,
        string fullName,
        string phone,
        string role,
        string successMessage,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (string.IsNullOrWhiteSpace(normalizedEmail)
            || string.IsNullOrWhiteSpace(password)
            || string.IsNullOrWhiteSpace(fullName)
            || string.IsNullOrWhiteSpace(phone))
        {
            return OperationResult<AuthResponseDto>.Fail(
                "Validation failed.",
                "Email, password, full name, and phone are required.");
        }

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            return OperationResult<AuthResponseDto>.Fail(
                "Registration failed.",
                "Email is already in use.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(password),
            FullName = fullName.Trim(),
            Phone = phone.Trim(),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);

        return OperationResult<AuthResponseDto>.Ok(
            BuildAuthResponse(user),
            successMessage);
    }

    private AuthResponseDto BuildAuthResponse(User user)
    {
        var (token, expiresAtUtc) = _tokenService.GenerateToken(user);
        return new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            Token = token,
            AvatarUrl = user.AvatarUrl,
            CoverUrl = user.CoverUrl,
            ExpiresAtUtc = expiresAtUtc
        };
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
