using Application.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Application.Common.Mappers
{
    internal class StaffMapper
    {
        public static ViewStaffDto ToViewDto(UserProfile p, string email, string phoneNumber)
        {
            return new ViewStaffDto
            {
                IdentityId = p.IdentityId,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = email,
                PhoneNumber = phoneNumber ?? "N/A",
                UserRole = p.UserRole,
                RegistrationDate = p.RegistrationDate
            };
        }
    }
}
