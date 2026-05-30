using Microsoft.EntityFrameworkCore;
using NakliyeApp.Application.DTOs.Advert;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;
using NakliyeApp.Infrastructure.Data;

namespace NakliyeApp.Infrastructure.Repositories;

public class AdvertRepository(AppDbContext db) : IAdvertRepository
{
    public async Task<Advert?> GetByIdAsync(int id) =>
        await db.Adverts
            .Include(a => a.Sender)
            .Include(a => a.Offers)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Advert>> GetOpenAdvertsAsync(AdvertFilterDto filter)
    {
        var query = db.Adverts
            .Include(a => a.Sender)
            .Include(a => a.Offers)
            .Where(a => a.Status == AdvertStatus.Open)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.City))
            query = query.Where(a =>
                a.OriginCity.Contains(filter.City) ||
                a.DestCity.Contains(filter.City));

        if (filter.TransportDate.HasValue)
            query = query.Where(a => a.TransportDate.Date == filter.TransportDate.Value.Date);

        if (!string.IsNullOrWhiteSpace(filter.CargoType))
            query = query.Where(a => a.CargoType.Contains(filter.CargoType));

        return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Advert>> GetByUserIdAsync(int userId) =>
        await db.Adverts
            .Include(a => a.Sender)
            .Include(a => a.Offers)
            .Where(a => a.SenderId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Advert>> GetAllAsync() =>
        await db.Adverts
            .Include(a => a.Sender)
            .Include(a => a.Offers)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

    public async Task<Advert> CreateAsync(Advert advert)
    {
        db.Adverts.Add(advert);
        await db.SaveChangesAsync();
        return await GetByIdAsync(advert.Id) ?? advert;
    }

    public async Task UpdateAsync(Advert advert)
    {
        db.Adverts.Update(advert);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var advert = await db.Adverts.FindAsync(id);
        if (advert != null)
        {
            db.Adverts.Remove(advert);
            await db.SaveChangesAsync();
        }
    }
}
