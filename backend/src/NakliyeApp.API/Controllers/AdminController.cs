using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakliyeApp.Application.DTOs.Admin;
using NakliyeApp.Application.Services;
using NakliyeApp.Domain.Enums;
using NakliyeApp.Infrastructure.Data;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(AdminService adminService, AppDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var now       = DateTime.UtcNow;
        var startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-5);
        var tr        = new System.Globalization.CultureInfo("tr-TR");

        // ── Temel sayaçlar ──────────────────────────────────────────────
        var stats = new AdminStatsDto
        {
            TotalUsers        = await db.Users.CountAsync(u => u.Role != UserRole.Admin),
            TotalSenders      = await db.Users.CountAsync(u => u.Role == UserRole.Sender),
            TotalCarriers     = await db.Users.CountAsync(u => u.Role == UserRole.Carrier),
            TotalAdverts      = await db.Adverts.CountAsync(),
            OpenAdverts       = await db.Adverts.CountAsync(a => a.Status == AdvertStatus.Open),
            CompletedAdverts  = await db.Adverts.CountAsync(a => a.Status == AdvertStatus.Completed),
            TotalOffers       = await db.Offers.CountAsync(),
            PendingComplaints = await db.Complaints.CountAsync(c => c.Status == "Pending"),
        };

        // ── Aylık kullanıcı kayıtları (son 6 ay) ──────────────────────
        var rawUserMonths = await db.Users
            .Where(u => u.Role != UserRole.Admin && u.CreatedAt >= startDate)
            .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var userMonthDict = rawUserMonths.ToDictionary(x => (x.Year, x.Month), x => x.Count);
        stats.MonthlyUserRegistrations = Enumerable.Range(0, 6).Select(i =>
        {
            var d = startDate.AddMonths(i);
            return new MonthlyCountDto(
                d.ToString("MMM yy", tr),
                userMonthDict.GetValueOrDefault((d.Year, d.Month), 0));
        }).ToList();

        // ── Aylık ilan oluşturma (son 6 ay) ───────────────────────────
        var rawAdvertMonths = await db.Adverts
            .Where(a => a.CreatedAt >= startDate)
            .GroupBy(a => new { a.CreatedAt.Year, a.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        var advertMonthDict = rawAdvertMonths.ToDictionary(x => (x.Year, x.Month), x => x.Count);
        stats.MonthlyAdvertCreations = Enumerable.Range(0, 6).Select(i =>
        {
            var d = startDate.AddMonths(i);
            return new MonthlyCountDto(
                d.ToString("MMM yy", tr),
                advertMonthDict.GetValueOrDefault((d.Year, d.Month), 0));
        }).ToList();

        // ── En çok ilan oluşturulan 5 şehir ───────────────────────────
        stats.TopCitiesByAdverts = (await db.Adverts
            .GroupBy(a => a.OriginCity)
            .Select(g => new { City = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync())
            .Select(x => new CityCountDto(x.City, x.Count))
            .ToList();

        // ── En yüksek puanlı 5 taşıyıcı ───────────────────────────────
        stats.TopRatedCarriers = (await db.Users
            .Where(u => u.Role == UserRole.Carrier && u.RatingCount > 0)
            .OrderByDescending(u => u.AverageRating)
            .ThenByDescending(u => u.RatingCount)
            .Take(5)
            .ToListAsync())
            .Select(u => new TopCarrierDto(
                $"{u.FirstName} {u.LastName}",
                u.AverageRating,
                u.RatingCount))
            .ToList();

        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await adminService.GetAllUsersAsync();
        return Ok(result);
    }

    [HttpPut("users/{id:int}/toggle")]
    public async Task<IActionResult> ToggleUser(int id)
    {
        await adminService.ToggleUserActiveAsync(id);
        return NoContent();
    }

    [HttpGet("adverts")]
    public async Task<IActionResult> GetAdverts()
    {
        var result = await adminService.GetAllAdvertsAsync();
        return Ok(result);
    }

    [HttpDelete("adverts/{id:int}")]
    public async Task<IActionResult> DeleteAdvert(int id)
    {
        await adminService.DeleteAdvertAsync(id);
        return NoContent();
    }

    [HttpGet("complaints")]
    public async Task<IActionResult> GetComplaints()
    {
        var complaints = await db.Complaints
            .Include(c => c.Reporter)
            .Include(c => c.Target)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Description,
                c.Status,
                c.CreatedAt,
                ReporterName = c.Reporter.FirstName + " " + c.Reporter.LastName,
                TargetName = c.Target != null ? c.Target.FirstName + " " + c.Target.LastName : null,
                c.AdvertId
            })
            .ToListAsync();
        return Ok(complaints);
    }

    [HttpPut("complaints/{id:int}/resolve")]
    public async Task<IActionResult> ResolveComplaint(int id, [FromBody] ResolveComplaintDto dto)
    {
        var complaint = await db.Complaints.FindAsync(id)
            ?? throw new KeyNotFoundException("Şikayet bulunamadı.");
        complaint.Status = dto.Status;
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record ResolveComplaintDto(string Status);
