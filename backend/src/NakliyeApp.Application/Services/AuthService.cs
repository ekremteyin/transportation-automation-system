using NakliyeApp.Application.DTOs.Auth;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;
using NakliyeApp.Domain.Enums;

namespace NakliyeApp.Application.Services;

public class AuthService(IUserRepository userRepo, IJwtTokenService jwtService, IPasswordHasher hasher)
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await userRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Bu e-posta adresi zaten kullanımda.");

        if (dto.Role == UserRole.Admin)
            throw new InvalidOperationException("Admin rolüyle kayıt yapılamaz.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email.ToLowerInvariant(),
            Phone = dto.Phone,
            PasswordHash = hasher.Hash(dto.Password),
            Role = dto.Role,
            VehicleType = dto.VehicleType,
            City = dto.City
        };

        var created = await userRepo.CreateAsync(user);
        return jwtService.GenerateToken(created);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await userRepo.GetByEmailAsync(dto.Email.ToLowerInvariant())
            ?? throw new UnauthorizedAccessException("Geçersiz e-posta veya şifre.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Hesabınız devre dışı bırakılmış.");

        if (!hasher.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Geçersiz e-posta veya şifre.");

        return jwtService.GenerateToken(user);
    }
}
