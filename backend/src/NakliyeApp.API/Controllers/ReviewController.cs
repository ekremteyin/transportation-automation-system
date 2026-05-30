using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NakliyeApp.Application.DTOs.Review;
using NakliyeApp.Application.Services;

namespace NakliyeApp.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ReviewController(ReviewService reviewService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("reviews")]
    [Authorize(Roles = "Sender")]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        var result = await reviewService.CreateAsync(UserId, dto);
        return StatusCode(201, result);
    }

    [HttpGet("users/{userId:int}/reviews")]
    public async Task<IActionResult> GetUserReviews(int userId)
    {
        var result = await reviewService.GetUserReviewsAsync(userId);
        return Ok(result);
    }
}
