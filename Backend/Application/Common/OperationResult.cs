namespace Application.Common;

public class OperationResult<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public List<string> Errors { get; init; } = [];
    public T? Data { get; init; }

    public static OperationResult<T> Ok(T data, string message = "Request completed successfully.")
    {
        return new OperationResult<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static OperationResult<T> Fail(string message, params string[] errors)
    {
        return new OperationResult<T>
        {
            Success = false,
            Message = message,
            Errors = errors.ToList()
        };
    }

    public static OperationResult<T> Fail(string message, IEnumerable<string> errors)
    {
        return new OperationResult<T>
        {
            Success = false,
            Message = message,
            Errors = errors.ToList()
        };
    }
}
