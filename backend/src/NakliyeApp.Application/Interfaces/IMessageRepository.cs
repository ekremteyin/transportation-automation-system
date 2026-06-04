using NakliyeApp.Application.DTOs.Message;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface IMessageRepository
{
    Task<IEnumerable<Message>> GetByOfferIdAsync(int offerId);
    Task<Message> CreateAsync(Message message);
    Task MarkReadAsync(int offerId, int userId);
    Task<int> GetTotalUnreadCountAsync(int userId);
    Task<IEnumerable<ConversationDto>> GetConversationsAsync(int userId);
}
