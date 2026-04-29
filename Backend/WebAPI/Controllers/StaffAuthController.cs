using Application.Common;
using Application.DTOs;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffAuthController : ControllerBase
    {
        private readonly ILogger<StaffAuthController> _logger;
        private readonly IStaffAuthService _service;

        public StaffAuthController(ILogger<StaffAuthController> logger, IStaffAuthService service)
        {
            _logger = logger;
            _service = service;
        }

        private Guid? GetCurrentUserId()
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(idValue, out var id) ? id : null;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<ViewStaffDto>>> GetById(Guid id)
        {
            // If the ID isn't found, the service throws NotFoundException.
            // The middleware catches it. This controller only handles the "Happy Path."
            var result = await _service.GetStaffDetailsAsync(id);
            return Ok(result);
        }

        //[Authorize(Roles = UserRoles.Admin)]
        [Consumes("multipart/form-data")]
        [HttpPost("{id}/profile-image")]
        public async Task<ActionResult<ViewStaffDto>> UpdateStaffProfileImage(Guid id, [FromForm] UpdateStaffProfileImageDto dto)
        {
            if (dto.Image == null || dto.Image.Length == 0)
            {
                return BadRequest(new { message = "Profile image is required." });
            }

            var result = await _service.UpdateStaffProfileImageAsync(id, dto.Image, GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ViewStaffDto>>> GetStaff([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            // Validate input to prevent database strain
            if (pageSize > 50) pageSize = 50;
            if (pageNumber < 1) pageNumber = 1;

            var result = await _service.GetPagedStaffAsync(pageNumber, pageSize, search);

            return Ok(result);
        }
        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPost("register")]
        public async Task<ActionResult<ViewStaffDto>> AddStaff([FromBody] CreateStaffDto createStaffDto)
        {
            var result = await _service.RegisterStaffAsync(createStaffDto, GetCurrentUserId());
            return Ok(result);
        }
        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPatch("update-role/{id}")]
        public async Task<ActionResult<ViewStaffDto>> UpdateStaffRole(Guid id, [FromQuery] string role)
        {
            var result = await _service.UpdateStaffRoleAsync(id, role);
            return Ok(result);
        }

        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPut("{id}")]
        public async Task<ActionResult<ViewStaffDto>> UpdateStaff(Guid id, [FromBody] UpdateStaffDto updateStaffDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            updateStaffDto.IdentityId = id.ToString();
            var result = await _service.UpdateStaffDetailsAsync(updateStaffDto, GetCurrentUserId());
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }
    }

}
