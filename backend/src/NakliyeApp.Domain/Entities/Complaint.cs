namespace NakliyeApp.Domain.Entities;

public class Complaint
{
    public int Id { get; set; }
    public int ReporterId { get; set; }
    public int? TargetId { get; set; }
    public int? AdvertId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Reporter { get; set; } = null!;
    public User? Target { get; set; }
    public Advert? Advert { get; set; }
}
