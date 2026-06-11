using Microsoft.EntityFrameworkCore;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;
using NakliyeApp.Infrastructure.Data;

namespace NakliyeApp.Infrastructure.Repositories;

public class OfferRepository(AppDbContext db) : IOfferRepository
{
    public async Task<Offer?> GetByIdAsync(int id) =>
        await db.Offers
            .Include(o => o.Carrier)
            .Include(o => o.Advert)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<IEnumerable<Offer>> GetByAdvertIdAsync(int advertId) =>
        await db.Offers
            .Include(o => o.Carrier)
            .Include(o => o.Advert)
            .Where(o => o.AdvertId == advertId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Offer>> GetByCarrierIdAsync(int carrierId) =>
        await db.Offers
            .Include(o => o.Advert)
            .Where(o => o.CarrierId == carrierId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<bool> ExistsAsync(int advertId, int carrierId) =>
        await db.Offers.AnyAsync(o => o.AdvertId == advertId && o.CarrierId == carrierId);

    public async Task<Offer> CreateAsync(Offer offer)
    {
        db.Offers.Add(offer);
        await db.SaveChangesAsync();
        return await GetByIdAsync(offer.Id) ?? offer;
    }

    public async Task UpdateAsync(Offer offer)
    {
        db.Offers.Update(offer);
        await db.SaveChangesAsync();
    }

    public async Task UpdateRangeAsync(IEnumerable<Offer> offers)
    {
        db.Offers.UpdateRange(offers);
        await db.SaveChangesAsync();
    }

    public async Task<int> CountCompletedJobsAsync(int carrierId) =>
        await db.Offers
            .Where(o => o.CarrierId == carrierId
                     && o.Status == OfferStatus.Accepted
                     && o.Advert!.Status == AdvertStatus.Completed)
            .CountAsync();
}
