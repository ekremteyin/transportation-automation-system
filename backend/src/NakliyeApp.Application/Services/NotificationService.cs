using NakliyeApp.Application.DTOs.Notification;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class NotificationService(INotificationRepository notifRepo) : INotificationService
{
    public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(int userId)
    {
        var notifs = await notifRepo.GetByUserIdAsync(userId);
        return notifs.Select(n => new NotificationDto
        {
            Id        = n.Id,
            Type      = n.Type.ToString(),
            Message   = n.Message,
            AdvertId  = n.AdvertId,
            IsRead    = n.IsRead,
            CreatedAt = n.CreatedAt
        });
    }

    public Task MarkAllReadAsync(int userId) => notifRepo.MarkAllReadAsync(userId);

    public Task NotifyNewOfferAsync(int senderId, int advertId, string route)
        => notifRepo.CreateAsync(new Notification
        {
            UserId   = senderId,
            Type     = NotificationType.NewOffer,
            Message  = $"'{route}' ilanınıza yeni bir teklif geldi.",
            AdvertId = advertId
        });

    public Task NotifyOfferAcceptedAsync(int carrierId, int advertId, string route)
        => notifRepo.CreateAsync(new Notification
        {
            UserId   = carrierId,
            Type     = NotificationType.OfferAccepted,
            Message  = $"'{route}' ilanına verdiğiniz teklif kabul edildi.",
            AdvertId = advertId
        });

    public Task NotifyOfferRejectedAsync(int carrierId, int advertId, string route)
        => notifRepo.CreateAsync(new Notification
        {
            UserId   = carrierId,
            Type     = NotificationType.OfferRejected,
            Message  = $"'{route}' ilanına verdiğiniz teklif reddedildi.",
            AdvertId = advertId
        });

    public Task NotifyStatusUpdatedAsync(int senderId, int advertId, string newStatus, string route)
    {
        var label = newStatus switch
        {
            "InProgress" => "taşıma başladı",
            "Completed"  => "taşıma tamamlandı",
            _            => newStatus
        };
        return notifRepo.CreateAsync(new Notification
        {
            UserId   = senderId,
            Type     = NotificationType.StatusUpdated,
            Message  = $"'{route}' ilanınızda {label}.",
            AdvertId = advertId
        });
    }
}
