using Microsoft.EntityFrameworkCore;
using NakliyeApp.Application.DTOs.Message;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Infrastructure.Data;

namespace NakliyeApp.Infrastructure.Repositories;

public class MessageRepository(AppDbContext db) : IMessageRepository
{
    public async Task<IEnumerable<Message>> GetByOfferIdAsync(int offerId)
        => await db.Messages
            .Include(m => m.Sender)
            .Where(m => m.OfferId == offerId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();

    public async Task<Message> CreateAsync(Message message)
    {
        db.Messages.Add(message);
        await db.SaveChangesAsync();
        await db.Entry(message).Reference(m => m.Sender).LoadAsync();
        return message;
    }

    public async Task MarkReadAsync(int offerId, int userId)
        => await db.Messages
            .Where(m => m.OfferId == offerId && m.SenderId != userId && !m.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, true));

    public async Task<int> GetTotalUnreadCountAsync(int userId)
    {
        var participantOfferIds = db.Offers
            .Where(o => o.CarrierId == userId || o.Advert.SenderId == userId)
            .Select(o => o.Id);

        return await db.Messages
            .Where(m => participantOfferIds.Contains(m.OfferId)
                     && m.SenderId != userId
                     && !m.IsRead)
            .CountAsync();
    }

    public async Task<IEnumerable<ConversationDto>> GetConversationsAsync(int userId)
    {
        var offers = await db.Offers
            .Include(o => o.Advert).ThenInclude(a => a.Sender)
            .Include(o => o.Carrier)
            .Where(o => o.CarrierId == userId || o.Advert.SenderId == userId)
            .ToListAsync();

        if (!offers.Any()) return [];

        var offerIds = offers.Select(o => o.Id).ToList();

        var lastMsgs = await db.Messages
            .Where(m => offerIds.Contains(m.OfferId))
            .GroupBy(m => m.OfferId)
            .Select(g => new
            {
                OfferId = g.Key,
                Content = g.OrderByDescending(m => m.CreatedAt).First().Content,
                SentAt  = g.Max(m => m.CreatedAt)
            })
            .ToListAsync();

        var unreads = await db.Messages
            .Where(m => offerIds.Contains(m.OfferId)
                     && m.SenderId != userId
                     && !m.IsRead)
            .GroupBy(m => m.OfferId)
            .Select(g => new { OfferId = g.Key, Count = g.Count() })
            .ToListAsync();

        var lastDict   = lastMsgs.ToDictionary(x => x.OfferId);
        var unreadDict = unreads.ToDictionary(x => x.OfferId, x => x.Count);

        return offers
            .Select(o =>
            {
                lastDict.TryGetValue(o.Id, out var lm);
                return new ConversationDto
                {
                    OfferId        = o.Id,
                    Route          = $"{o.Advert.OriginCity} → {o.Advert.DestCity}",
                    OtherPartyName = o.CarrierId == userId
                        ? $"{o.Advert.Sender.FirstName} {o.Advert.Sender.LastName}"
                        : $"{o.Carrier.FirstName} {o.Carrier.LastName}",
                    LastMessage   = lm?.Content,
                    LastMessageAt = lm?.SentAt,
                    UnreadCount   = unreadDict.TryGetValue(o.Id, out var uc) ? uc : 0
                };
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ThenByDescending(c => c.OfferId)
            .ToList();
    }
}
