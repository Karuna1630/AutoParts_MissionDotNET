using Application.Common.Exceptions;
using System.Net;
using WebAPI.Common;

namespace WebAPI.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unhandled exception for {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);

                var (statusCode, message) = MapException(ex);

                context.Response.StatusCode = (int)statusCode;
                context.Response.ContentType = "application/json";

                var response = new ApiResponse
                {
                    Success = false,
                    Message = message,
                    Errors = _environment.IsDevelopment()
                        ? [ex.Message]
                        : []
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }

        private static (HttpStatusCode StatusCode, string Message) MapException(Exception ex)
        {
            return ex switch
            {
                NotFoundException => (HttpStatusCode.NotFound, ex.Message),
                KeyNotFoundException => (HttpStatusCode.NotFound, "Requested resource was not found."),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "You are not authorized to perform this action."),
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
                _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.")
            };
        }
    }
}
