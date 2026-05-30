using System.Net;
using System.Text.Json;

namespace NakliyeApp.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(ctx, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext ctx, Exception ex)
    {
        var (status, message) = ex switch
        {
            InvalidOperationException  => (HttpStatusCode.BadRequest, ex.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, ex.Message),
            KeyNotFoundException        => (HttpStatusCode.NotFound, ex.Message),
            _                          => (HttpStatusCode.InternalServerError, "Sunucu hatası oluştu.")
        };

        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)status;

        var body = JsonSerializer.Serialize(new { error = message });
        return ctx.Response.WriteAsync(body);
    }
}
