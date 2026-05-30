using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? VehicleType { get; set; }
    public string? City { get; set; }
    public decimal AverageRating { get; set; } = 0;
    public int RatingCount { get; set; } = 0;

    public ICollection<Advert> Adverts { get; set; } = [];
    public ICollection<Offer> Offers { get; set; } = [];
}
