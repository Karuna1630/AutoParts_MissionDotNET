using Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class ViewStaffDto
    {
        public Guid IdentityId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string DisplayName => $"{FirstName} {LastName}";
        public string? ProfilePictureUrl { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public UserRole UserRole { get; set; }
        public string LastManagedBy { get; set; } = string.Empty;
        public DateTime LastManagedDate { get; set; }
    }
}
