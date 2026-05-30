using NakliyeApp.Application.DTOs.Advert;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class AdvertService(IAdvertRepository advertRepo)
{
    public async Task<AdvertDto> CreateAsync(int senderId, CreateAdvertDto dto)
    {
        var advert = new Advert
        {
            SenderId = senderId,
            CargoType = dto.CargoType,
            CargoWeight = dto.CargoWeight,
            OriginCity = dto.OriginCity,
            OriginDistrict = dto.OriginDistrict,
            DestCity = dto.DestCity,
            DestDistrict = dto.DestDistrict,
            TransportDate = dto.TransportDate,
            Description = dto.Description
        };
        var created = await advertRepo.CreateAsync(advert);
        return MapToDto(created);
    }

    public async Task<IEnumerable<AdvertDto>> GetMyAdvertsAsync(int userId)
    {
        var adverts = await advertRepo.GetByUserIdAsync(userId);
        return adverts.Select(MapToDto);
    }

    public async Task<AdvertDto> GetByIdAsync(int id, int requestingUserId, string role)
    {
        var advert = await advertRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (role == "Sender" && advert.SenderId != requestingUserId)
            throw new UnauthorizedAccessException("Bu ilana erişim yetkiniz yok.");

        return MapToDto(advert);
    }

    public async Task<AdvertDto> UpdateAsync(int id, int senderId, UpdateAdvertDto dto)
    {
        var advert = await advertRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.SenderId != senderId)
            throw new UnauthorizedAccessException("Bu ilanı düzenleme yetkiniz yok.");

        if (advert.Status != AdvertStatus.Open)
            throw new InvalidOperationException("Sadece açık ilanlar düzenlenebilir.");

        advert.CargoType = dto.CargoType;
        advert.CargoWeight = dto.CargoWeight;
        advert.OriginCity = dto.OriginCity;
        advert.OriginDistrict = dto.OriginDistrict;
        advert.DestCity = dto.DestCity;
        advert.DestDistrict = dto.DestDistrict;
        advert.TransportDate = dto.TransportDate;
        advert.Description = dto.Description;
        advert.UpdatedAt = DateTime.UtcNow;

        await advertRepo.UpdateAsync(advert);
        return MapToDto(advert);
    }

    public async Task DeleteAsync(int id, int senderId)
    {
        var advert = await advertRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.SenderId != senderId)
            throw new UnauthorizedAccessException("Bu ilanı silme yetkiniz yok.");

        if (advert.Status == AdvertStatus.InProgress)
            throw new InvalidOperationException("Aktif taşımadaki ilan silinemez.");

        await advertRepo.DeleteAsync(id);
    }

    public async Task<IEnumerable<AdvertDto>> GetOpenAdvertsAsync(AdvertFilterDto filter)
    {
        var adverts = await advertRepo.GetOpenAdvertsAsync(filter);
        return adverts.Select(MapToDto);
    }

    private static AdvertDto MapToDto(Advert a) => new()
    {
        Id = a.Id,
        SenderId = a.SenderId,
        SenderName = a.Sender != null ? $"{a.Sender.FirstName} {a.Sender.LastName}" : "",
        CargoType = a.CargoType,
        CargoWeight = a.CargoWeight,
        OriginCity = a.OriginCity,
        OriginDistrict = a.OriginDistrict,
        DestCity = a.DestCity,
        DestDistrict = a.DestDistrict,
        TransportDate = a.TransportDate,
        Description = a.Description,
        Status = a.Status.ToString(),
        OfferCount = a.Offers?.Count ?? 0,
        CreatedAt = a.CreatedAt
    };
}
