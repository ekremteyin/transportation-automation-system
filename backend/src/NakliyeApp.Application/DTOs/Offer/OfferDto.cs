namespace NakliyeApp.Application.DTOs.Offer;

public class OfferDto
{
    public int Id { get; set; }
    public int AdvertId { get; set; }
    public string AdvertRoute { get; set; } = string.Empty;
    public string? CargoType { get; set; }
    public DateTime? TransportDate { get; set; }
    public int CarrierId { get; set; }
    public string CarrierName { get; set; } = string.Empty;
    public string? CarrierVehicleType { get; set; }
    public decimal CarrierRating { get; set; }
    public decimal Price { get; set; }
    public DateTime? EstimatedDate { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = string.Empty;
    public string AdvertStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
