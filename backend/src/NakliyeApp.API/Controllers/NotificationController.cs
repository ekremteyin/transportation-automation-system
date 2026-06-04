using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NakliyeApp.Application.Interfaces;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController(INotificationService notifService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var result = await notifService.GetMyNotificationsAsync(UserId);
        return Ok(result);
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> ReadAll()
    {
        await notifService.MarkAllReadAsync(UserId);
        return NoContent();
    }
}
