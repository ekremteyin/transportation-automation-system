namespace NakliyeApp.Application.DTOs.Message;

public class ConversationDto
{
    public int OfferId { get; set; }
    public string Route { get; set; } = string.Empty;
    public string OtherPartyName { get; set; } = string.Empty;
    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
}
