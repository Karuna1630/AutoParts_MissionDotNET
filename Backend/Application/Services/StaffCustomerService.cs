using Application.Common;
using Application.DTOs.Customer;
using Application.Interfaces.Repositories;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Domain.Constants;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services;

/// <summary>
/// Handles staff customer management workflows.
/// </summary>
public class StaffCustomerService : IStaffCustomerService
{
    private readonly IUserRepository _userRepository;
    private readonly IGenericRepository<Customer> _customerRepository;
    private readonly IGenericRepository<Vehicle> _vehicleRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IImageService _imageService;

    public StaffCustomerService(
        IUserRepository userRepository,
        IGenericRepository<Customer> customerRepository,
        IGenericRepository<Vehicle> vehicleRepository,
        IPasswordHasher passwordHasher,
        IImageService imageService)
    {
        _userRepository = userRepository;
        _customerRepository = customerRepository;
        _vehicleRepository = vehicleRepository;
        _passwordHasher = passwordHasher;
        _imageService = imageService;
    }

    /// <summary>
    /// Registers a customer and first vehicle.
    /// </summary>
    public async Task<OperationResult<CustomerResponseDto>> RegisterCustomerAsync(RegisterCustomerWithVehicleDto dto)
    {
        // 1. Check if user already exists by email
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail))
        {
            return OperationResult<CustomerResponseDto>.Fail("A user with this email already exists.");
        }

        // 2. Create User account
        var user = new User
        {
            Email = dto.Email.Trim().ToLowerInvariant(),
            FullName = dto.FullName.Trim(),
            Phone = dto.Phone.Trim(),
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = UserRoles.Customer,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        // Note: We need the User.Id to link the Customer.
        // Assuming AddAsync doesn't save yet, we might need a way to get the ID if it's identity.
        // Usually SaveChanges is called here.
        
        // 3. Create Customer profile
        var customer = new Customer
        {
            User = user,
            CreditBalance = 0
        };

        await _customerRepository.AddAsync(customer);

        // 4. Create Vehicle record
        var vehicle = new Vehicle
        {
            Customer = customer,
            VehicleNumber = dto.VehicleNumber,
            VehicleModel = dto.VehicleModel,
            VehicleMake = dto.VehicleMake,
            VehicleYear = dto.VehicleYear,
            VehicleColor = dto.VehicleColor,
            IsPrimary = true,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.VehicleImage != null)
        {
            var imageUrl = await _imageService.UploadImageAsync(dto.VehicleImage, "vehicles");
            if (!string.IsNullOrEmpty(imageUrl))
            {
                vehicle.ImageUrl = imageUrl;
            }
        }

        await _vehicleRepository.AddAsync(vehicle);

        // Save all
        await _customerRepository.SaveChangesAsync();

        return OperationResult<CustomerResponseDto>.Ok(MapToResponse(customer), "Customer and vehicle registered successfully.");
    }

    /// <summary>
    /// Searches customers by name, email, phone, or vehicle number.
    /// </summary>
    public async Task<OperationResult<List<CustomerResponseDto>>> SearchCustomersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return OperationResult<List<CustomerResponseDto>>.Ok(new List<CustomerResponseDto>());
        }

        int.TryParse(query, out int id);
        var lowerQuery = query.ToLower();

        var customers = await _customerRepository.GetAllWithIncludeAsync(
            c => (c.User.Email != null && c.User.Email.ToLower().Contains(lowerQuery)) || 
                 (c.User.Phone != null && c.User.Phone.Contains(lowerQuery)) || 
                 (c.User.FullName != null && c.User.FullName.ToLower().Contains(lowerQuery)) || 
                 c.Vehicles.Any(v => v.VehicleNumber != null && v.VehicleNumber.ToLower().Contains(lowerQuery)) ||
                 c.Id == id,
            c => c.User,
            c => c.Vehicles
        );

        return OperationResult<List<CustomerResponseDto>>.Ok(customers.Select(MapToResponse).ToList());
    }

    /// <summary>
    /// Returns a customer by identifier.
    /// </summary>
    public async Task<OperationResult<CustomerResponseDto>> GetCustomerByIdAsync(int customerId)
    {
        var customer = await _customerRepository.GetByIdWithIncludeAsync(customerId, c => c.User, c => c.Vehicles);
        if (customer == null)
        {
            return OperationResult<CustomerResponseDto>.Fail("Customer not found.");
        }

        return OperationResult<CustomerResponseDto>.Ok(MapToResponse(customer));
    }

    /// <summary>
    /// Returns a paged customer list.
    /// </summary>
    public async Task<OperationResult<List<CustomerResponseDto>>> GetAllCustomersAsync(int pageNumber, int pageSize)
    {
        // Simple pagination for demonstration
        var customers = await _customerRepository.GetAllWithIncludeAsync(
            c => true,
            c => c.User,
            c => c.Vehicles
        );

        var result = customers
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse)
            .ToList();

        return OperationResult<List<CustomerResponseDto>>.Ok(result);
    }

    /// <summary>
    /// Adds a vehicle to a customer profile.
    /// </summary>
    public async Task<OperationResult<CustomerResponseDto>> AddVehicleAsync(int customerId, AddVehicleToCustomerDto dto)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null)
        {
            return OperationResult<CustomerResponseDto>.Fail("Customer not found.");
        }

        // Check if vehicle number already exists for this customer
        var existing = await _vehicleRepository.FindAsync(v => v.CustomerId == customerId && v.VehicleNumber == dto.VehicleNumber);
        if (existing.Any())
        {
            return OperationResult<CustomerResponseDto>.Fail("Vehicle already registered for this customer.");
        }

        var vehicle = new Vehicle
        {
            CustomerId = customerId,
            VehicleNumber = dto.VehicleNumber,
            VehicleModel = dto.VehicleModel,
            VehicleMake = dto.VehicleMake,
            VehicleYear = dto.VehicleYear,
            VehicleColor = dto.VehicleColor,
            IsPrimary = false,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.VehicleImage != null)
        {
            var imageUrl = await _imageService.UploadImageAsync(dto.VehicleImage, "vehicles");
            if (!string.IsNullOrEmpty(imageUrl))
            {
                vehicle.ImageUrl = imageUrl;
            }
        }

        await _vehicleRepository.AddAsync(vehicle);
        await _vehicleRepository.SaveChangesAsync();

        return await GetCustomerByIdAsync(customerId);
    }

    /// <summary>
    /// Applies a credit payment to a customer balance.
    /// </summary>
    public async Task<OperationResult<CustomerResponseDto>> SettleCreditAsync(int customerId, SettleCreditDto dto)
    {
        var customer = await _customerRepository.GetByIdWithIncludeAsync(customerId, c => c.User, c => c.Vehicles);
        if (customer == null)
        {
            return OperationResult<CustomerResponseDto>.Fail("Customer not found.");
        }

        if (customer.CreditBalance < dto.Amount)
        {
            // Optional: allow overpayment or limit to current balance
            // For now, let's just subtract it.
        }

        customer.CreditBalance -= dto.Amount;
        
        // Ensure balance doesn't go below 0 (unless you want to allow advance payments/credits)
        if (customer.CreditBalance < 0) customer.CreditBalance = 0;

        _customerRepository.Update(customer);
        await _customerRepository.SaveChangesAsync();

        return OperationResult<CustomerResponseDto>.Ok(MapToResponse(customer), $"Payment of Rs. {dto.Amount:N2} processed. New balance: Rs. {customer.CreditBalance:N2}");
    }

    private CustomerResponseDto MapToResponse(Customer customer)
    {
        return new CustomerResponseDto
        {
            Id = customer.Id,
            UserId = customer.UserId,
            Email = customer.User.Email,
            FullName = customer.User.FullName,
            Phone = customer.User.Phone,
            AvatarUrl = customer.User.AvatarUrl,
            CreditBalance = customer.CreditBalance,
            Vehicles = customer.Vehicles.Select(v => new CustomerVehicleResponseDto
            {
                Id = v.Id,
                VehicleNumber = v.VehicleNumber,
                VehicleModel = v.VehicleModel,
                VehicleMake = v.VehicleMake,
                VehicleYear = v.VehicleYear,
                VehicleColor = v.VehicleColor,
                IsPrimary = v.IsPrimary,
                ImageUrl = v.ImageUrl
            }).ToList()
        };
    }
}
