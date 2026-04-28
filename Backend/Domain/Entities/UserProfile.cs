using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class UserProfile
    {
        public Guid IdentityId { get; set; }
        public string FirstName { get; set; } =string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DisplayName => $"{FirstName} {LastName}";
        public string? ProfilePictureUrl { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public UserRole UserRole { get; set;}
        public Guid LastManagedBy { get; set; }
        public DateTime LastManagedDate { get; set; }
    }
}
