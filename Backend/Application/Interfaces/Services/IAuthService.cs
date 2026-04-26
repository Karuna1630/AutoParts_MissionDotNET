using Application.Common;
using Application.DTOs.Auth;

namespace Application.Interfaces.Services;

public interface IAuthService
{
    Task<OperationResult<AuthResponseDto>> RegisterCustomerAsync(
        RegisterCustomerRequestDto request,
        CancellationToken cancellationToken = default);

    Task<OperationResult<AuthResponseDto>> CreateStaffAsync(
        CreateStaffRequestDto request,
        CancellationToken cancellationToken = default);

    Task<OperationResult<AuthResponseDto>> LoginAsync(
        LoginRequestDto request,
        CancellationToken cancellationToken = default);
}
