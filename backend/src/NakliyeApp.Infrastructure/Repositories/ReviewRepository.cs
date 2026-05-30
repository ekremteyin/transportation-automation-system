using Microsoft.EntityFrameworkCore;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Infrastructure.Data;

namespace NakliyeApp.Infrastructure.Repositories;

public class ReviewRepository(AppDbContext db) : IReviewRepository
{
    public async Task<IEnumerable<Review>> GetByReviewedIdAsync(int userId) =>
        await db.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewed)
            .Include(r => r.Advert)
            .Where(r => r.ReviewedId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<bool> ExistsAsync(int advertId, int reviewerId) =>
        await db.Reviews.AnyAsync(r => r.AdvertId == advertId && r.ReviewerId == reviewerId);

    public async Task<Review> CreateAsync(Review review)
    {
        db.Reviews.Add(review);
        await db.SaveChangesAsync();
        return await db.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Reviewed)
            .Include(r => r.Advert)
            .FirstAsync(r => r.Id == review.Id);
    }
}
