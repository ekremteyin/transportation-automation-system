namespace NakliyeApp.Application.DTOs.Message;

public class MessageDto
{
    public int Id { get; set; }
    public int OfferId { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public bool IsMine { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
