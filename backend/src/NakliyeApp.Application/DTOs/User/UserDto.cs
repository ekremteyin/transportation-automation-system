namespace NakliyeApp.Application.DTOs.User;

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? VehicleType { get; set; }
    public string? City { get; set; }
    public decimal AverageRating { get; set; }
    public int RatingCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
