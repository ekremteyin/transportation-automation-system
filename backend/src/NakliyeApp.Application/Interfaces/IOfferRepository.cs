using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(int id);
    Task<IEnumerable<Offer>> GetByAdvertIdAsync(int advertId);
    Task<IEnumerable<Offer>> GetByCarrierIdAsync(int carrierId);
    Task<bool> ExistsAsync(int advertId, int carrierId);
    Task<Offer> CreateAsync(Offer offer);
    Task UpdateAsync(Offer offer);
    Task UpdateRangeAsync(IEnumerable<Offer> offers);
    Task<int> CountCompletedJobsAsync(int carrierId);
}
