using Application.Common;
using Application.Common.Interfaces;
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
    private readonly IIdentityService _identityService;
    private readonly IUserRepo _userRepo;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IIdentityService identityService,
        IUserRepo userRepo)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _identityService = identityService;
        _userRepo = userRepo;
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

    /// <summary>
    /// Unified login for all user types (Customer, Staff, Admin).
    ///
    /// Path A — Domain User (AppUsers table):
    ///   Handles Customers and any user created via the legacy User entity path.
    ///   Password verified with Pbkdf2PasswordHasher.
    ///
    /// Path B — Identity User (AspNetUsers + UserProfiles):
    ///   Handles Staff and Admin registered via StaffAuthService (Identity + UserProfile).
    ///   Password verified via UserManager.CheckPasswordAsync.
    ///   NameIdentifier in JWT = Identity Guid so profile endpoints resolve correctly.
    /// </summary>
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

        // ── Path A: Domain User (Customer / Admin with AppUsers row) ──────────
        var domainUser = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (domainUser is not null)
        {
            if (!_passwordHasher.Verify(request.Password, domainUser.PasswordHash))
            {
                return OperationResult<AuthResponseDto>.Fail(
                    "Authentication failed.",
                    "Invalid email or password.");
            }

            if (!domainUser.IsActive)
            {
                return OperationResult<AuthResponseDto>.Fail(
                    "Authentication failed.",
                    "This account has been deactivated.");
            }

            return OperationResult<AuthResponseDto>.Ok(
                BuildAuthResponse(domainUser),
                "Login successful.");
        }

        // ── Path B: Identity User (Staff / Admin without AppUsers row) ────────
        var (found, identityId, role) = await _identityService.FindByEmailAsync(normalizedEmail);
        if (!found)
        {
            // Neither store has this email — same generic message to prevent enumeration
            return OperationResult<AuthResponseDto>.Fail(
                "Authentication failed.",
                "Invalid email or password.");
        }

        var passwordValid = await _identityService.CheckPasswordAsync(normalizedEmail, request.Password);
        if (!passwordValid)
        {
            return OperationResult<AuthResponseDto>.Fail(
                "Authentication failed.",
                "Invalid email or password.");
        }

        // Fetch UserProfile for display data (name, picture)
        var profile = await _userRepo.GetByIdAsync(identityId);
        var fullName = profile?.DisplayName ?? normalizedEmail;
        var avatarUrl = profile?.ProfilePictureUrl;

        var (token, expiresAtUtc) = _tokenService.GenerateToken(
            email: normalizedEmail,
            role: role,
            identityId: identityId.ToString(),
            fullName: fullName);

        return OperationResult<AuthResponseDto>.Ok(
            new AuthResponseDto
            {
                IdentityId   = identityId,
                Email        = normalizedEmail,
                FullName     = fullName,
                Role         = role,
                Token        = token,
                AvatarUrl    = avatarUrl,
                ExpiresAtUtc = expiresAtUtc
            },
            "Login successful.");
    }

    // ── Private helpers ───────────────────────────────────────────────────────

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
            Email        = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(password),
            FullName     = fullName.Trim(),
            Phone        = phone.Trim(),
            Role         = role,
            CreatedAt    = DateTime.UtcNow
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
            UserId       = user.Id,
            Email        = user.Email,
            FullName     = user.FullName,
            Role         = user.Role,
            Token        = token,
            AvatarUrl    = user.AvatarUrl,
            CoverUrl     = user.CoverUrl,
            ExpiresAtUtc = expiresAtUtc
        };
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();
}
