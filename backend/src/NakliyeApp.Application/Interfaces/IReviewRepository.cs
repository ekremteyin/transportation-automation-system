using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface IReviewRepository
{
    Task<IEnumerable<Review>> GetByReviewedIdAsync(int userId);
    Task<bool> ExistsAsync(int advertId, int reviewerId);
    Task<Review> CreateAsync(Review review);
}
