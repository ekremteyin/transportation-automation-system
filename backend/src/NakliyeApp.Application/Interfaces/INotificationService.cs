using NakliyeApp.Application.DTOs.Notification;

namespace NakliyeApp.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(int userId);
    Task MarkAllReadAsync(int userId);
    Task NotifyNewOfferAsync(int senderId, int advertId, string route);
    Task NotifyOfferAcceptedAsync(int carrierId, int advertId, string route);
    Task NotifyOfferRejectedAsync(int carrierId, int advertId, string route);
    Task NotifyStatusUpdatedAsync(int senderId, int advertId, string newStatus, string route);
}
