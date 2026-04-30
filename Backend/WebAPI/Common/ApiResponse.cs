namespace WebAPI.Common
{
    /// <summary>
    /// simple response object
    /// </summary>
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }
    }
    /// <summary>
    /// for generic response object
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class ApiResponse<T> : ApiResponse
    {
        public T? Data { get; set; }

    }
}
