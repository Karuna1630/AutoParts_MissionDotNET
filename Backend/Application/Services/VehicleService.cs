using Application.DTOs.Common;
using Application.DTOs.Vehicle;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using AutoMapper;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class VehicleService : IVehicleService
{
    private readonly IGenericRepository<Vehicle> _vehicleRepository;
    private readonly IUserRepository _userRepository;
    private readonly IGenericRepository<Customer> _customerRepository;
    private readonly IMapper _mapper;
    private readonly IImageService _imageService;
    private readonly ILogger<VehicleService> _logger;

    public VehicleService(
        IGenericRepository<Vehicle> vehicleRepository,
        IUserRepository userRepository,
        IGenericRepository<Customer> customerRepository,
        IMapper mapper,
        IImageService imageService,
        ILogger<VehicleService> logger)
    {
        _vehicleRepository = vehicleRepository;
        _userRepository = userRepository;
        _customerRepository = customerRepository;
        _mapper = mapper;
        _imageService = imageService;
        _logger = logger;
    }

    public async Task<ApiResponse<VehicleResponseDto>> AddVehicleAsync(int userId, CreateVehicleDto dto)
    {
        try
        {
            _logger.LogInformation("Adding new vehicle for user {UserId}", userId);

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("User not found");
            }

            var customerList = await _customerRepository.FindAsync(c => c.UserId == userId);
            var customer = customerList.FirstOrDefault();
            if (customer == null)
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("Customer profile not found");
            }

            int customerId = customer.Id;

            // Check for duplicate vehicle number for this customer
            var existingVehicles = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId && v.VehicleNumber == dto.VehicleNumber);
            if (existingVehicles.Any())
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("Vehicle number already registered for this customer");
            }

            var vehicle = _mapper.Map<Vehicle>(dto);
            vehicle.CustomerId = customerId;
            vehicle.CreatedAt = DateTime.UtcNow;

            // If it's the first vehicle, make it primary
            var totalVehicles = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId);
            if (!totalVehicles.Any())
            {
                vehicle.IsPrimary = true;
            }

            // Handle image upload
            if (dto.Image != null)
            {
                var imageUrl = await _imageService.UploadImageAsync(dto.Image, "vehicles");
                if (!string.IsNullOrEmpty(imageUrl))
                {
                    vehicle.ImageUrl = imageUrl;
                }
            }

            await _vehicleRepository.AddAsync(vehicle);
            await _vehicleRepository.SaveChangesAsync();

            var response = _mapper.Map<VehicleResponseDto>(vehicle);
            response.CustomerName = user.FullName;

            return ApiResponse<VehicleResponseDto>.SuccessResponse(response, "Vehicle added successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding vehicle for user {UserId}", userId);
            return ApiResponse<VehicleResponseDto>.FailureResponse("An error occurred while adding the vehicle");
        }
    }

    public async Task<ApiResponse<IEnumerable<VehicleResponseDto>>> GetCustomerVehiclesAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Fetching vehicles for user {UserId}", userId);
            
            var vehicles = await _vehicleRepository.GetAllWithIncludeAsync(
                v => v.Customer!.UserId == userId,
                v => v.Customer!
            );

            var response = _mapper.Map<IEnumerable<VehicleResponseDto>>(vehicles);
            return ApiResponse<IEnumerable<VehicleResponseDto>>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vehicles for user {UserId}", userId);
            return ApiResponse<IEnumerable<VehicleResponseDto>>.FailureResponse("An error occurred while fetching vehicles");
        }
    }

    public async Task<ApiResponse<VehicleResponseDto>> GetVehicleByIdAsync(int vehicleId, int userId)
    {
        try
        {
            var vehicle = await _vehicleRepository.GetByIdWithIncludeAsync(vehicleId, v => v.Customer!);
            
            if (vehicle == null || vehicle.Customer!.UserId != userId)
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("Vehicle not found");
            }

            var response = _mapper.Map<VehicleResponseDto>(vehicle);
            return ApiResponse<VehicleResponseDto>.SuccessResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching vehicle {VehicleId}", vehicleId);
            return ApiResponse<VehicleResponseDto>.FailureResponse("An error occurred while fetching the vehicle");
        }
    }

    public async Task<ApiResponse<VehicleResponseDto>> UpdateVehicleAsync(int vehicleId, int userId, UpdateVehicleDto dto)
    {
        try
        {
            var vehicle = await _vehicleRepository.GetByIdWithIncludeAsync(vehicleId, v => v.Customer!);
            
            if (vehicle == null || vehicle.Customer!.UserId != userId)
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("Vehicle not found");
            }

            int customerId = vehicle.CustomerId;

            // Check for duplicate vehicle number if changed
            if (vehicle.VehicleNumber != dto.VehicleNumber)
            {
                var existing = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId && v.VehicleNumber == dto.VehicleNumber);
                if (existing.Any())
                {
                    return ApiResponse<VehicleResponseDto>.FailureResponse("Another vehicle with this number already exists");
                }
            }

            // Update properties manually to match profile update pattern
            vehicle.VehicleMake = dto.VehicleMake;
            vehicle.VehicleModel = dto.VehicleModel;
            vehicle.VehicleNumber = dto.VehicleNumber;
            vehicle.VehicleYear = dto.VehicleYear;
            vehicle.VehicleColor = dto.VehicleColor;
            vehicle.UpdatedAt = DateTime.UtcNow;

            // Handle Primary logic if IsPrimary is requested
            if (dto.IsPrimary && !vehicle.IsPrimary)
            {
                await UnsetOtherPrimaryVehicles(customerId);
                vehicle.IsPrimary = true;
            }

            // Handle image upload
            if (dto.Image != null)
            {
                var imageUrl = await _imageService.UploadImageAsync(dto.Image, "vehicles");
                if (!string.IsNullOrEmpty(imageUrl))
                {
                    vehicle.ImageUrl = imageUrl;
                }
            }

            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();

            var response = _mapper.Map<VehicleResponseDto>(vehicle);
            return ApiResponse<VehicleResponseDto>.SuccessResponse(response, "Vehicle updated successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating vehicle {VehicleId}", vehicleId);
            return ApiResponse<VehicleResponseDto>.FailureResponse("An error occurred while updating the vehicle");
        }
    }

    public async Task<ApiResponse<bool>> DeleteVehicleAsync(int vehicleId, int userId)
    {
        try
        {
            var vehicle = await _vehicleRepository.GetByIdWithIncludeAsync(vehicleId, v => v.Customer!);
            
            if (vehicle == null || vehicle.Customer!.UserId != userId)
            {
                return ApiResponse<bool>.FailureResponse("Vehicle not found");
            }

            int customerId = vehicle.CustomerId;

            bool wasPrimary = vehicle.IsPrimary;
            _vehicleRepository.Remove(vehicle);
            await _vehicleRepository.SaveChangesAsync();

            // If we deleted a primary vehicle, make another one primary if exists
            if (wasPrimary)
            {
                var others = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId);
                if (others.Any())
                {
                    var newPrimary = others.First();
                    newPrimary.IsPrimary = true;
                    _vehicleRepository.Update(newPrimary);
                    await _vehicleRepository.SaveChangesAsync();
                }
            }

            return ApiResponse<bool>.SuccessResponse(true, "Vehicle deleted successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting vehicle {VehicleId}", vehicleId);
            return ApiResponse<bool>.FailureResponse("An error occurred while deleting the vehicle");
        }
    }

    public async Task<ApiResponse<VehicleResponseDto>> SetPrimaryVehicleAsync(int vehicleId, int userId)
    {
        try
        {
            var vehicle = await _vehicleRepository.GetByIdWithIncludeAsync(vehicleId, v => v.Customer!);
            
            if (vehicle == null || vehicle.Customer!.UserId != userId)
            {
                return ApiResponse<VehicleResponseDto>.FailureResponse("Vehicle not found");
            }

            int customerId = vehicle.CustomerId;

            if (vehicle.IsPrimary)
            {
                return ApiResponse<VehicleResponseDto>.SuccessResponse(_mapper.Map<VehicleResponseDto>(vehicle), "Vehicle is already primary");
            }

            await UnsetOtherPrimaryVehicles(customerId);
            
            vehicle.IsPrimary = true;
            _vehicleRepository.Update(vehicle);
            await _vehicleRepository.SaveChangesAsync();

            return ApiResponse<VehicleResponseDto>.SuccessResponse(_mapper.Map<VehicleResponseDto>(vehicle), "Vehicle set as primary");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting primary vehicle {VehicleId}", vehicleId);
            return ApiResponse<VehicleResponseDto>.FailureResponse("An error occurred while updating primary status");
        }
    }

    private async Task UnsetOtherPrimaryVehicles(int customerId)
    {
        var primaryVehicles = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId && v.IsPrimary);
        foreach (var v in primaryVehicles)
        {
            v.IsPrimary = false;
            _vehicleRepository.Update(v);
        }
    }
}
