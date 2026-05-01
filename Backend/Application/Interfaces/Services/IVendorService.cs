using Application.Common;
using Application.DTOs.Common;
using Application.DTOs.Vendor;

namespace Application.Interfaces.Services;

public interface IVendorService
{
    Task<ApiResponse<PagedResult<VendorResponseDto>>> GetVendorsAsync(int pageNumber, int pageSize, string? search = null);
    Task<ApiResponse<VendorResponseDto>> GetVendorByIdAsync(int id);
    Task<ApiResponse<VendorResponseDto>> CreateVendorAsync(CreateVendorDto dto);
    Task<ApiResponse<VendorResponseDto>> UpdateVendorAsync(int id, UpdateVendorDto dto);
    Task<ApiResponse<bool>> DeleteVendorAsync(int id);
}
