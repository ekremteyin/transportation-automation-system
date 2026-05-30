namespace NakliyeApp.Application.DTOs.Advert;

public class UpdateAdvertDto
{
    public string CargoType { get; set; } = string.Empty;
    public string? CargoWeight { get; set; }
    public string OriginCity { get; set; } = string.Empty;
    public string? OriginDistrict { get; set; }
    public string DestCity { get; set; } = string.Empty;
    public string? DestDistrict { get; set; }
    public DateTime TransportDate { get; set; }
    public string? Description { get; set; }
}
