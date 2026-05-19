using Application.Common;
using Application.DTOs.Auth;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Common;

namespace WebAPI.Controllers;

/// <summary>
/// Exposes customer authentication endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    /// <summary>
    /// Registers a customer account.
    /// </summary>
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RegisterCustomer(
        [FromBody] RegisterCustomerRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterCustomerAsync(request, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(ToApiResponse(result));
        }

        return Ok(ToApiResponse(result));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    /// <summary>
    /// Logs a user in and returns an auth token.
    /// </summary>
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        if (!result.Success)
        {
            return Unauthorized(ToApiResponse(result));
        }

        return Ok(ToApiResponse(result));
    }

    private static ApiResponse<AuthResponseDto> ToApiResponse(OperationResult<AuthResponseDto> result)
    {
        return new ApiResponse<AuthResponseDto>
        {
            Success = result.Success,
            Message = result.Message,
            Errors = result.Errors,
            Data = result.Data
        };
    }
}
