using AutoMapper;
using Domain.Entities;
using Application.DTOs.Vehicle;
using Application.DTOs.Vendor;

namespace Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateVehicleDto, Vehicle>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());

        CreateMap<UpdateVehicleDto, Vehicle>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore());

        CreateMap<Vehicle, VehicleResponseDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.FullName : string.Empty));

        CreateMap<CreateVendorDto, Vendor>();
        CreateMap<UpdateVendorDto, Vendor>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));
        CreateMap<Vendor, VendorResponseDto>();
    }
}
