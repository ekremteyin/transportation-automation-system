using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Domain.Entities;

public class Advert
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string CargoType { get; set; } = string.Empty;
    public string? CargoWeight { get; set; }
    public string OriginCity { get; set; } = string.Empty;
    public string? OriginDistrict { get; set; }
    public string DestCity { get; set; } = string.Empty;
    public string? DestDistrict { get; set; }
    public DateTime TransportDate { get; set; }
    public string? Description { get; set; }
    public string? PhotoPath { get; set; }
    public AdvertStatus Status { get; set; } = AdvertStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public User Sender { get; set; } = null!;
    public ICollection<Offer> Offers { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
