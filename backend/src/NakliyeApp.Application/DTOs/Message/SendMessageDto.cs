namespace NakliyeApp.Application.DTOs.Message;

public class SendMessageDto
{
    public int OfferId { get; set; }
    public string Content { get; set; } = string.Empty;
}
