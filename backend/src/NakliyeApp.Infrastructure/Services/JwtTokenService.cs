using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NakliyeApp.Application.DTOs.Auth;
using NakliyeApp.Application.Interfaces;
using NakliyeApp.Domain.Entities;

namespace NakliyeApp.Infrastructure.Services;

public class JwtTokenService(IConfiguration config) : IJwtTokenService
{
    public AuthResponseDto GenerateToken(User user)
    {
        var jwt = config.GetSection("JwtSettings");
        var secret = jwt["Secret"] ?? throw new InvalidOperationException("JWT secret not configured");
        var expireHours = int.Parse(jwt["ExpireHours"] ?? "24");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(expireHours);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName)
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Role = user.Role.ToString(),
            ExpiresAt = expiresAt,
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}"
        };
    }
}
