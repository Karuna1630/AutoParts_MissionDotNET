using Application.Common;
using Application.DTOs.Customer;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.Services;

public interface IStaffCustomerService
{
    Task<OperationResult<CustomerResponseDto>> RegisterCustomerAsync(RegisterCustomerWithVehicleDto dto);
    Task<OperationResult<List<CustomerResponseDto>>> SearchCustomersAsync(string query);
    Task<OperationResult<CustomerResponseDto>> GetCustomerByIdAsync(int customerId);
    Task<OperationResult<List<CustomerResponseDto>>> GetAllCustomersAsync(int pageNumber, int pageSize);
    Task<OperationResult<CustomerResponseDto>> AddVehicleAsync(int customerId, AddVehicleToCustomerDto dto);
}
