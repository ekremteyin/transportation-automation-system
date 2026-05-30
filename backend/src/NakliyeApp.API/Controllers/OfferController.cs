using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NakliyeApp.Application.DTOs.Offer;
using NakliyeApp.Application.Services;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class OfferController(OfferService offerService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("offers")]
    [Authorize(Roles = "Carrier")]
    public async Task<IActionResult> Create([FromBody] CreateOfferDto dto)
    {
        var result = await offerService.CreateAsync(UserId, dto);
        return StatusCode(201, result);
    }

    [HttpGet("adverts/{advertId:int}/offers")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> GetByAdvert(int advertId)
    {
        var result = await offerService.GetByAdvertIdAsync(advertId, UserId);
        return Ok(result);
    }

    [HttpGet("offers/my")]
    [Authorize(Roles = "Carrier")]
    public async Task<IActionResult> GetMy()
    {
        var result = await offerService.GetMyOffersAsync(UserId);
        return Ok(result);
    }

    [HttpPut("offers/{id:int}/accept")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Accept(int id)
    {
        var result = await offerService.AcceptAsync(id, UserId);
        return Ok(result);
    }

    [HttpPut("offers/{id:int}/reject")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Reject(int id)
    {
        var result = await offerService.RejectAsync(id, UserId);
        return Ok(result);
    }

    [HttpPut("adverts/{advertId:int}/status")]
    [Authorize(Roles = "Carrier")]
    public async Task<IActionResult> UpdateStatus(int advertId, [FromBody] UpdateStatusDto dto)
    {
        await offerService.UpdateAdvertStatusAsync(advertId, UserId, dto.Status);
        return NoContent();
    }
}

public record UpdateStatusDto(string Status);
