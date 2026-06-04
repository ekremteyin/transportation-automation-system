namespace NakliyeApp.Application.Interfaces;

public interface IGeoService
{
    Task<GeoData?> GetGeoDataAsync(
        string originCity, string? originDistrict,
        string destCity, string? destDistrict);
}

public record GeoData(
    double OriginLat, double OriginLng,
    double DestLat, double DestLng,
    double DistanceKm, int EstimatedDurationMin);
