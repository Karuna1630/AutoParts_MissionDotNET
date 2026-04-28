using Application.DTOs.Common;
using Application.DTOs.Vehicle;

namespace Application.Interfaces.Services;

public interface IVehicleService
{
    Task<ApiResponse<VehicleResponseDto>> AddVehicleAsync(int customerId, CreateVehicleDto dto);
    Task<ApiResponse<IEnumerable<VehicleResponseDto>>> GetCustomerVehiclesAsync(int customerId);
    Task<ApiResponse<VehicleResponseDto>> GetVehicleByIdAsync(int vehicleId, int customerId);
    Task<ApiResponse<VehicleResponseDto>> UpdateVehicleAsync(int vehicleId, int customerId, UpdateVehicleDto dto);
    Task<ApiResponse<bool>> DeleteVehicleAsync(int vehicleId, int customerId);
    Task<ApiResponse<VehicleResponseDto>> SetPrimaryVehicleAsync(int vehicleId, int customerId);
}
