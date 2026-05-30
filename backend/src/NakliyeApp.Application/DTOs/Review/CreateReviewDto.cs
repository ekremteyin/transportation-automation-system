namespace NakliyeApp.Application.DTOs.Review;

public class CreateReviewDto
{
    public int AdvertId { get; set; }
    public int ReviewedId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
}
