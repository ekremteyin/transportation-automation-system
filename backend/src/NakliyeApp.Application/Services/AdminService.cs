using NakliyeApp.Application.DTOs.Admin;
using NakliyeApp.Application.DTOs.User;
using NakliyeApp.Application.DTOs.Advert;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class AdminService(IUserRepository userRepo, IAdvertRepository advertRepo)
{
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await userRepo.GetAllAsync();
        return users
            .Where(u => u.Role != UserRole.Admin)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                VehicleType = u.VehicleType,
                City = u.City,
                AverageRating = u.AverageRating,
                RatingCount = u.RatingCount,
                CreatedAt = u.CreatedAt
            });
    }

    public async Task ToggleUserActiveAsync(int userId)
    {
        var user = await userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        if (user.Role == UserRole.Admin)
            throw new InvalidOperationException("Admin hesabı devre dışı bırakılamaz.");

        user.IsActive = !user.IsActive;
        await userRepo.UpdateAsync(user);
    }

    public async Task<IEnumerable<AdvertDto>> GetAllAdvertsAsync()
    {
        var all = await advertRepo.GetAllAsync();
        return all.Select(a => new AdvertDto
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
        });
    }

    public async Task DeleteAdvertAsync(int advertId)
    {
        await advertRepo.DeleteAsync(advertId);
    }
}
