using Application.Common;
using Application.DTOs.Common;
using Application.DTOs.Vendor;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<VendorService> _logger;

    public VendorService(IVendorRepository vendorRepository, IMapper mapper, ILogger<VendorService> logger)
    {
        _vendorRepository = vendorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ApiResponse<PagedResult<VendorResponseDto>>> GetVendorsAsync(int pageNumber, int pageSize, string? search = null)
    {
        try
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var vendors = await _vendorRepository.GetPagedAsync(pageNumber, pageSize, search);
            var items = _mapper.Map<List<VendorResponseDto>>(vendors.Items);

            var result = new PagedResult<VendorResponseDto>
            {
                Items = items,
                PageNumber = vendors.PageNumber,
                PageSize = vendors.PageSize,
                TotalCount = vendors.TotalCount
            };

            return ApiResponse<PagedResult<VendorResponseDto>>.SuccessResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vendors");
            return ApiResponse<PagedResult<VendorResponseDto>>.FailureResponse("An error occurred while fetching vendors");
        }
    }

    public async Task<ApiResponse<VendorResponseDto>> GetVendorByIdAsync(int id)
    {
        try
        {
            var vendor = await _vendorRepository.GetByIdAsync(id);
            if (vendor == null)
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Vendor not found");
            }

            return ApiResponse<VendorResponseDto>.SuccessResponse(_mapper.Map<VendorResponseDto>(vendor));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vendor {VendorId}", id);
            return ApiResponse<VendorResponseDto>.FailureResponse("An error occurred while fetching vendor details");
        }
    }

    public async Task<ApiResponse<VendorResponseDto>> CreateVendorAsync(CreateVendorDto dto)
    {
        try
        {
            if (await _vendorRepository.ExistsByCompanyNameAsync(dto.CompanyName))
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Company name already exists");
            }

            if (await _vendorRepository.ExistsByEmailAsync(dto.Email))
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Email already exists");
            }

            var vendor = _mapper.Map<Vendor>(dto);
            vendor.CreatedAt = DateTime.UtcNow;

            await _vendorRepository.AddAsync(vendor);

            return ApiResponse<VendorResponseDto>.SuccessResponse(_mapper.Map<VendorResponseDto>(vendor), "Vendor created successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating vendor");
            return ApiResponse<VendorResponseDto>.FailureResponse("An error occurred while creating vendor");
        }
    }

    public async Task<ApiResponse<VendorResponseDto>> UpdateVendorAsync(int id, UpdateVendorDto dto)
    {
        try
        {
            var vendor = await _vendorRepository.GetByIdAsync(id);
            if (vendor == null)
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Vendor not found");
            }

            if (await _vendorRepository.ExistsByCompanyNameAsync(dto.CompanyName, id))
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Company name already exists");
            }

            if (await _vendorRepository.ExistsByEmailAsync(dto.Email, id))
            {
                return ApiResponse<VendorResponseDto>.FailureResponse("Email already exists");
            }

            _mapper.Map(dto, vendor);
            vendor.UpdatedAt = DateTime.UtcNow;

            await _vendorRepository.UpdateAsync(vendor);

            return ApiResponse<VendorResponseDto>.SuccessResponse(_mapper.Map<VendorResponseDto>(vendor), "Vendor updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating vendor {VendorId}", id);
            return ApiResponse<VendorResponseDto>.FailureResponse("An error occurred while updating vendor");
        }
    }

    public async Task<ApiResponse<bool>> DeleteVendorAsync(int id)
    {
        try
        {
            var vendor = await _vendorRepository.GetByIdAsync(id);
            if (vendor == null)
            {
                return ApiResponse<bool>.FailureResponse("Vendor not found");
            }

            await _vendorRepository.DeleteAsync(vendor);
            return ApiResponse<bool>.SuccessResponse(true, "Vendor deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting vendor {VendorId}", id);
            return ApiResponse<bool>.FailureResponse("An error occurred while deleting vendor");
        }
    }
}
