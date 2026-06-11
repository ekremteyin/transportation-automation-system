using NakliyeApp.Application.DTOs.Offer;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class OfferService(IOfferRepository offerRepo, IAdvertRepository advertRepo, INotificationService notifService)
{
    public async Task<OfferDto> CreateAsync(int carrierId, CreateOfferDto dto)
    {
        var advert = await advertRepo.GetByIdAsync(dto.AdvertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.Status != AdvertStatus.Open)
            throw new InvalidOperationException("Sadece açık ilanlara teklif verilebilir.");

        if (advert.SenderId == carrierId)
            throw new InvalidOperationException("Kendi ilanınıza teklif veremezsiniz.");

        if (await offerRepo.ExistsAsync(dto.AdvertId, carrierId))
            throw new InvalidOperationException("Bu ilana zaten teklif verdiniz.");

        var offer = new Offer
        {
            AdvertId = dto.AdvertId,
            CarrierId = carrierId,
            Price = dto.Price,
            EstimatedDate = dto.EstimatedDate,
            Note = dto.Note
        };

        var created = await offerRepo.CreateAsync(offer);

        await notifService.NotifyNewOfferAsync(
            advert.SenderId, advert.Id,
            $"{advert.OriginCity} → {advert.DestCity}");

        return MapToDto(created);
    }

    public async Task<IEnumerable<OfferDto>> GetByAdvertIdAsync(int advertId, int senderId)
    {
        var advert = await advertRepo.GetByIdAsync(advertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.SenderId != senderId)
            throw new UnauthorizedAccessException("Bu ilanın tekliflerini görme yetkiniz yok.");

        var offers = await offerRepo.GetByAdvertIdAsync(advertId);
        return offers.Select(MapToDto);
    }

    public async Task<IEnumerable<OfferDto>> GetMyOffersAsync(int carrierId)
    {
        var offers = await offerRepo.GetByCarrierIdAsync(carrierId);
        return offers.Select(MapToDto);
    }

    public async Task<OfferDto> AcceptAsync(int offerId, int senderId)
    {
        var offer = await offerRepo.GetByIdAsync(offerId)
            ?? throw new KeyNotFoundException("Teklif bulunamadı.");

        var advert = await advertRepo.GetByIdAsync(offer.AdvertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.SenderId != senderId)
            throw new UnauthorizedAccessException("Bu teklifi kabul etme yetkiniz yok.");

        if (advert.Status != AdvertStatus.Open)
            throw new InvalidOperationException("İlan artık açık değil.");

        // Kabul edilen teklifi güncelle
        offer.Status = OfferStatus.Accepted;
        await offerRepo.UpdateAsync(offer);

        // Diğer teklifleri reddet
        var others = (await offerRepo.GetByAdvertIdAsync(offer.AdvertId))
            .Where(o => o.Id != offerId && o.Status == OfferStatus.Pending)
            .ToList();
        others.ForEach(o => o.Status = OfferStatus.Rejected);
        await offerRepo.UpdateRangeAsync(others);

        // İlan durumunu güncelle
        advert.Status = AdvertStatus.Matched;
        advert.UpdatedAt = DateTime.UtcNow;
        await advertRepo.UpdateAsync(advert);

        await notifService.NotifyOfferAcceptedAsync(
            offer.CarrierId, offer.AdvertId,
            $"{advert.OriginCity} → {advert.DestCity}");

        return MapToDto(offer);
    }

    public async Task<OfferDto> RejectAsync(int offerId, int senderId)
    {
        var offer = await offerRepo.GetByIdAsync(offerId)
            ?? throw new KeyNotFoundException("Teklif bulunamadı.");

        var advert = await advertRepo.GetByIdAsync(offer.AdvertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        if (advert.SenderId != senderId)
            throw new UnauthorizedAccessException("Bu teklifi reddetme yetkiniz yok.");

        offer.Status = OfferStatus.Rejected;
        await offerRepo.UpdateAsync(offer);

        await notifService.NotifyOfferRejectedAsync(
            offer.CarrierId, offer.AdvertId,
            $"{advert.OriginCity} → {advert.DestCity}");

        return MapToDto(offer);
    }

    public async Task UpdateAdvertStatusAsync(int advertId, int carrierId, string newStatus)
    {
        var advert = await advertRepo.GetByIdAsync(advertId)
            ?? throw new KeyNotFoundException("İlan bulunamadı.");

        // Kabul edilen teklif bu taşıyıcıya ait mi?
        var acceptedOffer = (await offerRepo.GetByAdvertIdAsync(advertId))
            .FirstOrDefault(o => o.Status == OfferStatus.Accepted && o.CarrierId == carrierId);

        if (acceptedOffer == null)
            throw new UnauthorizedAccessException("Bu ilanın durumunu güncelleme yetkiniz yok.");

        var validTransitions = new Dictionary<AdvertStatus, AdvertStatus>
        {
            { AdvertStatus.Matched,     AdvertStatus.InProgress },
            { AdvertStatus.InProgress,  AdvertStatus.Completed  }
        };

        if (!Enum.TryParse<AdvertStatus>(newStatus, out var target))
            throw new InvalidOperationException("Geçersiz durum.");

        if (!validTransitions.TryGetValue(advert.Status, out var allowed) || allowed != target)
            throw new InvalidOperationException($"'{advert.Status}' durumundan '{target}' durumuna geçiş yapılamaz.");

        advert.Status = target;
        advert.UpdatedAt = DateTime.UtcNow;
        await advertRepo.UpdateAsync(advert);

        await notifService.NotifyStatusUpdatedAsync(
            advert.SenderId, advert.Id,
            target.ToString(),
            $"{advert.OriginCity} → {advert.DestCity}");
    }

    public async Task<CarrierStatsDto> GetCarrierStatsAsync(int carrierId)
    {
        var completedJobs = await offerRepo.CountCompletedJobsAsync(carrierId);
        return new CarrierStatsDto { CompletedJobs = completedJobs };
    }

    private static OfferDto MapToDto(Offer o) => new()
    {
        Id = o.Id,
        AdvertId = o.AdvertId,
        AdvertRoute = o.Advert != null ? $"{o.Advert.OriginCity} → {o.Advert.DestCity}" : "",
        CargoType = o.Advert?.CargoType,
        TransportDate = o.Advert?.TransportDate,
        CarrierId = o.CarrierId,
        CarrierName = o.Carrier != null ? $"{o.Carrier.FirstName} {o.Carrier.LastName}" : "",
        CarrierVehicleType = o.Carrier?.VehicleType,
        CarrierRating = o.Carrier?.AverageRating ?? 0,
        Price = o.Price,
        EstimatedDate = o.EstimatedDate,
        Note = o.Note,
        Status = o.Status.ToString(),
        AdvertStatus = o.Advert?.Status.ToString() ?? "",
        CreatedAt = o.CreatedAt
    };
}
