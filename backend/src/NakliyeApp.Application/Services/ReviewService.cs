using NakliyeApp.Application.DTOs.Review;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class ReviewService(
    IReviewRepository reviewRepo,
    IAdvertRepository advertRepo,
    IUserRepository userRepo)
{
    public async Task<ReviewDto> CreateAsync(int reviewerId, CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new InvalidOperationException("Puan 1 ile 5 arasında olmalıdır.");

        var advert = await advertRepo.GetByIdAsync(dto.AdvertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.Status != AdvertStatus.Completed)
            throw new InvalidOperationException("Yalnızca tamamlanmış taşımalar için değerlendirme yapılabilir.");

        if (advert.SenderId != reviewerId)
            throw new UnauthorizedAccessException("Bu taşımayı değerlendirme yetkiniz yok.");

        if (await reviewRepo.ExistsAsync(dto.AdvertId, reviewerId))
            throw new InvalidOperationException("Bu taşımayı zaten değerlendirdiniz.");

        var review = new Review
        {
            AdvertId = dto.AdvertId,
            ReviewerId = reviewerId,
            ReviewedId = dto.ReviewedId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        var created = await reviewRepo.CreateAsync(review);

        // Taşıyıcının ortalama puanını güncelle
        var carrier = await userRepo.GetByIdAsync(dto.ReviewedId);
        if (carrier != null)
        {
            carrier.RatingCount++;
            var reviews = await reviewRepo.GetByReviewedIdAsync(dto.ReviewedId);
            carrier.AverageRating = reviews.Any()
                ? Math.Round((decimal)reviews.Average(r => r.Rating), 2)
                : dto.Rating;
            await userRepo.UpdateAsync(carrier);
        }

        return MapToDto(created);
    }

    public async Task<IEnumerable<ReviewDto>> GetUserReviewsAsync(int userId)
    {
        var reviews = await reviewRepo.GetByReviewedIdAsync(userId);
        return reviews.Select(MapToDto);
    }

    private static ReviewDto MapToDto(Review r) => new()
    {
        Id = r.Id,
        AdvertId = r.AdvertId,
        AdvertRoute = r.Advert != null ? $"{r.Advert.OriginCity} → {r.Advert.DestCity}" : "",
        ReviewerId = r.ReviewerId,
        ReviewerName = r.Reviewer != null ? $"{r.Reviewer.FirstName} {r.Reviewer.LastName}" : "",
        ReviewedId = r.ReviewedId,
        ReviewedName = r.Reviewed != null ? $"{r.Reviewed.FirstName} {r.Reviewed.LastName}" : "",
        Rating = r.Rating,
        Comment = r.Comment,
        CreatedAt = r.CreatedAt
    };
}
