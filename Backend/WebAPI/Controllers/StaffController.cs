using Application.Common;
using Application.DTOs;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    /// <summary>
    /// Exposes staff administration endpoints.
    /// </summary>
    [Authorize(Roles = UserRoles.Admin)]
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly ILogger<StaffController> _logger;
        private readonly IStaffAuthService _staffService;

        public StaffController(ILogger<StaffController> logger, IStaffAuthService staffService)
        {
            _logger = logger;
            _staffService = staffService;
        }

        /// <summary>
        /// Returns paged staff members.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStaff([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageSize > 50) pageSize = 50;
            if (pageNumber < 1) pageNumber = 1;

            var result = await _staffService.GetPagedStaffAsync(pageNumber, pageSize);
            return Ok(new { success = true, data = result });
        }

        /// <summary>
        /// Returns a staff member by identifier.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(Guid id)
        {
            var result = await _staffService.GetStaffDetailsAsync(id);
            return Ok(new { success = true, data = result });
        }

        /// <summary>
        /// Creates a staff member.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> AddStaff([FromBody] CreateStaffDto createStaffDto)
        {
            var result = await _staffService.RegisterStaffAsync(createStaffDto);
            return Ok(new { success = true, message = "Staff member created successfully.", data = result });
        }

        /// <summary>
        /// Updates a staff member role.
        /// </summary>
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateStaffRole(Guid id, [FromQuery] string role)
        {
            var result = await _staffService.UpdateStaffRoleAsync(id, role);
            return Ok(new { success = true, message = $"Staff role updated to {role}." });
        }

        /// <summary>
        /// Deletes a staff member.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(Guid id)
        {
            await _staffService.DeleteStaffAsync(id);
            return Ok(new { success = true, message = "Staff member deleted successfully." });
        }
    }
}
