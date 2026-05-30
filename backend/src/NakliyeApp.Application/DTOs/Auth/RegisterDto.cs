using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.DTOs.Auth;

public class RegisterDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; }

    // Carrier-specific
    public string? VehicleType { get; set; }
    public string? City { get; set; }
}
