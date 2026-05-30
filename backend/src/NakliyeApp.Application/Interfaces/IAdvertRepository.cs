using NakliyeApp.Application.DTOs.Advert;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface IAdvertRepository
{
    Task<Advert?> GetByIdAsync(int id);
    Task<IEnumerable<Advert>> GetOpenAdvertsAsync(AdvertFilterDto filter);
    Task<IEnumerable<Advert>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Advert>> GetAllAsync();
    Task<Advert> CreateAsync(Advert advert);
    Task UpdateAsync(Advert advert);
    Task DeleteAsync(int id);
}
