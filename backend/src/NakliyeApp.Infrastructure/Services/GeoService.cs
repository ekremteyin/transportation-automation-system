using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using NakliyeApp.Application.Interfaces;

namespace NakliyeApp.Infrastructure.Services;

public class GeoService(HttpClient httpClient, ILogger<GeoService> logger) : IGeoService
{
    public async Task<GeoData?> GetGeoDataAsync(
        string originCity, string? originDistrict,
        string destCity, string? destDistrict)
    {
        var origin = await GeocodeAsync(originCity, originDistrict);
        if (origin == null)
        {
            logger.LogWarning("Geocode başarısız: {City}/{District}", originCity, originDistrict);
            return null;
        }

        var dest = await GeocodeAsync(destCity, destDistrict);
        if (dest == null)
        {
            logger.LogWarning("Geocode başarısız: {City}/{District}", destCity, destDistrict);
            return null;
        }

        return await GetRouteAsync(origin.Value, dest.Value);
    }

    private async Task<(double Lat, double Lng)?> GeocodeAsync(string city, string? district)
    {
        try
        {
            var query = string.IsNullOrWhiteSpace(district)
                ? $"{city},Turkey"
                : $"{district},{city},Turkey";

            var url = "https://nominatim.openstreetmap.org/search"
                    + $"?q={Uri.EscapeDataString(query)}&format=json&limit=1&countrycodes=tr";

            var results = await httpClient.GetFromJsonAsync<NominatimResult[]>(url);
            if (results == null || results.Length == 0) return null;

            return (
                double.Parse(results[0].Lat, CultureInfo.InvariantCulture),
                double.Parse(results[0].Lon, CultureInfo.InvariantCulture)
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Nominatim isteği başarısız: {City}", city);
            return null;
        }
    }

    private async Task<GeoData?> GetRouteAsync((double Lat, double Lng) origin, (double Lat, double Lng) dest)
    {
        try
        {
            var lng1 = origin.Lng.ToString(CultureInfo.InvariantCulture);
            var lat1 = origin.Lat.ToString(CultureInfo.InvariantCulture);
            var lng2 = dest.Lng.ToString(CultureInfo.InvariantCulture);
            var lat2 = dest.Lat.ToString(CultureInfo.InvariantCulture);

            var url = $"https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=false";

            var response = await httpClient.GetFromJsonAsync<OsrmResponse>(url);
            if (response?.Routes == null || response.Routes.Length == 0) return null;

            var route = response.Routes[0];
            return new GeoData(
                OriginLat: origin.Lat,
                OriginLng: origin.Lng,
                DestLat: dest.Lat,
                DestLng: dest.Lng,
                DistanceKm: Math.Round(route.Distance / 1000.0, 1),
                EstimatedDurationMin: (int)(route.Duration / 60.0)
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OSRM isteği başarısız");
            return null;
        }
    }

    private record NominatimResult(
        [property: JsonPropertyName("lat")] string Lat,
        [property: JsonPropertyName("lon")] string Lon);

    private record OsrmResponse(
        [property: JsonPropertyName("routes")] OsrmRoute[] Routes);

    private record OsrmRoute(
        [property: JsonPropertyName("distance")] double Distance,
        [property: JsonPropertyName("duration")] double Duration);
}
