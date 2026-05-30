using NakliyeApp.Application.DTOs.Auth;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Application.Interfaces;

public interface IJwtTokenService
{
    AuthResponseDto GenerateToken(User user);
}
