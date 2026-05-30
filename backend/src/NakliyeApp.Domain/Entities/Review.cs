namespace NakliyeApp.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int AdvertId { get; set; }
    public int ReviewerId { get; set; }
    public int ReviewedId { get; set; }
    public byte Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Advert Advert { get; set; } = null!;
    public User Reviewer { get; set; } = null!;
    public User Reviewed { get; set; } = null!;
}
