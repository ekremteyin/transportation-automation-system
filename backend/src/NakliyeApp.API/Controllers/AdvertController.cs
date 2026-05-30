using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NakliyeApp.Application.DTOs.Advert;
using NakliyeApp.Application.Services;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api/adverts")]
[Authorize]
public class AdvertController(AdvertService advertService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string UserRole => User.FindFirstValue(ClaimTypes.Role)!;

    [HttpPost]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Create([FromBody] CreateAdvertDto dto)
    {
        var result = await advertService.CreateAsync(UserId, dto);
        return StatusCode(201, result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> GetMyAdverts()
    {
        var result = await advertService.GetMyAdvertsAsync(UserId);
        return Ok(result);
    }

    [HttpGet("open")]
    [Authorize(Roles = "Carrier")]
    public async Task<IActionResult> GetOpenAdverts([FromQuery] AdvertFilterDto filter)
    {
        var result = await advertService.GetOpenAdvertsAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await advertService.GetByIdAsync(id, UserId, UserRole);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAdvertDto dto)
    {
        var result = await advertService.UpdateAsync(id, UserId, dto);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Delete(int id)
    {
        await advertService.DeleteAsync(id, UserId);
        return NoContent();
    }
}
