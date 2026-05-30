namespace NakliyeApp.Application.DTOs.Offer;

public class CreateOfferDto
{
    public int AdvertId { get; set; }
    public decimal Price { get; set; }
    public DateTime? EstimatedDate { get; set; }
    public string? Note { get; set; }
}
