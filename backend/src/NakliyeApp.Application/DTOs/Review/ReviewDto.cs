namespace NakliyeApp.Application.DTOs.Review;

public class ReviewDto
{
    public int Id { get; set; }
    public int AdvertId { get; set; }
    public string AdvertRoute { get; set; } = string.Empty;
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public int ReviewedId { get; set; }
    public string ReviewedName { get; set; } = string.Empty;
    public byte Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
