using Application.Common;
using Application.DTOs;
using Application.Interfaces.Services;
using Domain.Constants;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<ViewStaffDto>>> GetById(Guid id)
        {
            // If the ID isn't found, the service throws NotFoundException.
            // The middleware catches it. This controller only handles the "Happy Path."
            var result = await _service.GetStaffDetailsAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ViewStaffDto>>> GetStaff([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            // Validate input to prevent database strain
            if (pageSize > 50) pageSize = 50;
            if (pageNumber < 1) pageNumber = 1;

            var result = await _service.GetPagedStaffAsync(pageNumber, pageSize);

            return Ok(result);
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<ViewStaffDto>> AddStaff([FromBody] CreateStaffDto createStaffDto)
        {
            var result = await _service.RegisterStaffAsync(createStaffDto);
            return Ok(result);
        }
        //[Authorize(Roles = UserRoles.Admin)]
        [HttpPatch("update-role/{id}")]
        public async Task<ActionResult<ViewStaffDto>> UpdateStaffRole(Guid id, [FromQuery] string role)
        {
            var result = await _service.UpdateStaffRoleAsync(id, role);
            return Ok(result);
        }
    }

}
