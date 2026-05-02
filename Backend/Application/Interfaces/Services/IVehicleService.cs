using Application.DTOs.Common;
using Application.DTOs.Vehicle;

namespace Application.Interfaces.Services;

public interface IVehicleService
{
    Task<ApiResponse<VehicleResponseDto>> AddVehicleAsync(int userId, CreateVehicleDto dto);
    Task<ApiResponse<IEnumerable<VehicleResponseDto>>> GetCustomerVehiclesAsync(int userId);
    Task<ApiResponse<VehicleResponseDto>> GetVehicleByIdAsync(int vehicleId, int userId);
    Task<ApiResponse<VehicleResponseDto>> UpdateVehicleAsync(int vehicleId, int userId, UpdateVehicleDto dto);
    Task<ApiResponse<bool>> DeleteVehicleAsync(int vehicleId, int userId);
    Task<ApiResponse<VehicleResponseDto>> SetPrimaryVehicleAsync(int vehicleId, int userId);
}
