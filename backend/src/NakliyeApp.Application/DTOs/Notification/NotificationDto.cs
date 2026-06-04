namespace NakliyeApp.Application.DTOs.Notification;

public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? AdvertId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
