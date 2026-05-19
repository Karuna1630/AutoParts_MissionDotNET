using Application.Common;
using Application.DTOs;
using Application.DTOs.Auth;
using Application.DTOs.Common;
using Application.Interfaces.Services;
using Application.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    /// <summary>
    /// Exposes staff authentication and profile endpoints.
    /// </summary>
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
        /// <summary>
        /// Returns a staff profile by identifier.
        /// </summary>
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
        /// <summary>
        /// Uploads a new profile image for a staff member.
        /// </summary>
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
        /// <summary>
        /// Returns a paged list of staff members.
        /// </summary>
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
        /// <summary>
        /// Creates a new staff member.
        /// </summary>
        public async Task<ActionResult<ViewStaffDto>> AddStaff([FromBody] CreateStaffDto createStaffDto)
        {
            var result = await _service.RegisterStaffAsync(createStaffDto, GetCurrentUserId());
            return Ok(result);
        }
        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPatch("update-role/{id}")]
        /// <summary>
        /// Updates a staff member role.
        /// </summary>
        public async Task<ActionResult<ViewStaffDto>> UpdateStaffRole(Guid id, [FromQuery] string role)
        {
            var result = await _service.UpdateStaffRoleAsync(id, role);
            return Ok(result);
        }

        [HttpPost("staff-login")]
        [AllowAnonymous]
        /// <summary>
        /// Logs a staff member in.
        /// </summary>
        public async Task<ActionResult> Login(
        [FromBody] LoginRequestDto request,
        CancellationToken cancellationToken)
        {
            var result = await _service.StaffLoginAsync(request);
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }
        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPut("{id}")]
        /// <summary>
        /// Updates staff profile details.
        /// </summary>
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
