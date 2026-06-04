namespace NakliyeApp.Domain.Entities;

public class Message
{
    public int Id { get; set; }
    public int OfferId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Offer Offer { get; set; } = null!;
    public User Sender { get; set; } = null!;
}
