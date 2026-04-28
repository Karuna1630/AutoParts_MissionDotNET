using Application.Interfaces.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Security;

public class CloudinaryImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService(IConfiguration configuration)
    {
        var cloudName = configuration["CLOUDINARY_CLOUD_NAME"] ?? configuration["Cloudinary:CloudName"];
        var apiKey = configuration["CLOUDINARY_API_KEY"] ?? configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["CLOUDINARY_API_SECRET"] ?? configuration["Cloudinary:ApiSecret"];

        Account account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folderName)
    {
        if (file.Length <= 0) return string.Empty;

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"AutoParts/{folderName}",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new Exception(uploadResult.Error.Message);
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);
        return result.Result == "ok";
    }
}
