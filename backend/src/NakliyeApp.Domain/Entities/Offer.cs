using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Domain.Entities;

public class Offer
{
    public int Id { get; set; }
    public int AdvertId { get; set; }
    public int CarrierId { get; set; }
    public decimal Price { get; set; }
    public DateTime? EstimatedDate { get; set; }
    public string? Note { get; set; }
    public OfferStatus Status { get; set; } = OfferStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Advert Advert { get; set; } = null!;
    public User Carrier { get; set; } = null!;
}
