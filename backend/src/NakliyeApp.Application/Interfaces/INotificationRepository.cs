using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
    Task CreateAsync(Notification notification);
    Task MarkAllReadAsync(int userId);
}
