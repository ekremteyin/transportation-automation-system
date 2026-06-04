namespace NakliyeApp.Application.DTOs.Advert;

public class AdvertDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string CargoType { get; set; } = string.Empty;
    public string? CargoWeight { get; set; }
    public string OriginCity { get; set; } = string.Empty;
    public string? OriginDistrict { get; set; }
    public string DestCity { get; set; } = string.Empty;
    public string? DestDistrict { get; set; }
    public DateTime TransportDate { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public int OfferCount { get; set; }
    public DateTime CreatedAt { get; set; }

    public double? OriginLat { get; set; }
    public double? OriginLng { get; set; }
    public double? DestLat { get; set; }
    public double? DestLng { get; set; }
    public double? DistanceKm { get; set; }
    public int? EstimatedDurationMin { get; set; }
}
