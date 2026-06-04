using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NakliyeApp.Application.DTOs.Message;
using NakliyeApp.Application.Services;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessageController(MessageService msgService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var result = await msgService.GetConversationsAsync(UserId);
        return Ok(result);
    }

    [HttpGet("offer/{offerId:int}")]
    public async Task<IActionResult> GetByOffer(int offerId)
    {
        var result = await msgService.GetByOfferIdAsync(offerId, UserId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
    {
        var result = await msgService.SendAsync(UserId, dto);
        return StatusCode(201, result);
    }

    [HttpPut("offer/{offerId:int}/read")]
    public async Task<IActionResult> MarkRead(int offerId)
    {
        await msgService.MarkReadAsync(offerId, UserId);
        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var count = await msgService.GetUnreadCountAsync(UserId);
        return Ok(new { count });
    }
}
