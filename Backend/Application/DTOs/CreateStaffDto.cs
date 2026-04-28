using Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateStaffDto
    {
        [Required(ErrorMessage ="Firstname is required")]
        public string FirstName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Lastname is required")]
        public string LastName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email is required")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Phonenumber is required")]
        [StringLength(10, ErrorMessage ="Invalid phone number")]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "Confirm password do not match!")]
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
        public UserRole UserRole { get; set; }
    }
}
