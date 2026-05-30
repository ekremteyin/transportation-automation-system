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
}
