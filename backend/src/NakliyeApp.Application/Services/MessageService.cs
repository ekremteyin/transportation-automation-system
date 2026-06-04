using NakliyeApp.Application.DTOs.Message;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Services;

public class MessageService(IMessageRepository msgRepo, IOfferRepository offerRepo)
{
    private async Task ValidateAccessAsync(int offerId, int userId)
    {
        var offer = await offerRepo.GetByIdAsync(offerId)
            ?? throw new KeyNotFoundException("Teklif bulunamadı.");

        if (offer.CarrierId != userId && offer.Advert.SenderId != userId)
            throw new UnauthorizedAccessException("Bu konuşmaya erişim yetkiniz yok.");
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(int userId)
        => await msgRepo.GetConversationsAsync(userId);

    public async Task<IEnumerable<MessageDto>> GetByOfferIdAsync(int offerId, int userId)
    {
        await ValidateAccessAsync(offerId, userId);
        var messages = await msgRepo.GetByOfferIdAsync(offerId);
        return messages.Select(m => MapToDto(m, userId));
    }

    public async Task<MessageDto> SendAsync(int userId, SendMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            throw new InvalidOperationException("Mesaj içeriği boş olamaz.");

        await ValidateAccessAsync(dto.OfferId, userId);

        var message = new Message
        {
            OfferId   = dto.OfferId,
            SenderId  = userId,
            Content   = dto.Content.Trim()
        };

        var created = await msgRepo.CreateAsync(message);
        return MapToDto(created, userId);
    }

    public async Task MarkReadAsync(int offerId, int userId)
    {
        await ValidateAccessAsync(offerId, userId);
        await msgRepo.MarkReadAsync(offerId, userId);
    }

    public Task<int> GetUnreadCountAsync(int userId)
        => msgRepo.GetTotalUnreadCountAsync(userId);

    private static MessageDto MapToDto(Message m, int currentUserId) => new()
    {
        Id         = m.Id,
        OfferId    = m.OfferId,
        SenderId   = m.SenderId,
        SenderName = m.Sender != null ? $"{m.Sender.FirstName} {m.Sender.LastName}" : "",
        IsMine     = m.SenderId == currentUserId,
        Content    = m.Content,
        IsRead     = m.IsRead,
        CreatedAt  = m.CreatedAt
    };
}
