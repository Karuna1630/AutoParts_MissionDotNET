using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Services;

public interface IImageService
{
    Task<string> UploadImageAsync(IFormFile file, string folderName);
    Task<bool> DeleteImageAsync(string publicId);
}
