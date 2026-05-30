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
        var stats = new AdminStatsDto
        {
            TotalUsers     = await db.Users.CountAsync(u => u.Role != UserRole.Admin),
            TotalSenders   = await db.Users.CountAsync(u => u.Role == UserRole.Sender),
            TotalCarriers  = await db.Users.CountAsync(u => u.Role == UserRole.Carrier),
            TotalAdverts   = await db.Adverts.CountAsync(),
            OpenAdverts    = await db.Adverts.CountAsync(a => a.Status == AdvertStatus.Open),
            CompletedAdverts = await db.Adverts.CountAsync(a => a.Status == AdvertStatus.Completed),
            TotalOffers    = await db.Offers.CountAsync(),
            PendingComplaints = await db.Complaints.CountAsync(c => c.Status == "Pending"),
        };
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
