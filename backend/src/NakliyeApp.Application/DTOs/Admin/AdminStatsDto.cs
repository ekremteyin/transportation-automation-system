namespace NakliyeApp.Application.DTOs.Admin;

public class AdminStatsDto
{
    // Temel sayaçlar
    public int TotalUsers { get; set; }
    public int TotalSenders { get; set; }
    public int TotalCarriers { get; set; }
    public int TotalAdverts { get; set; }
    public int OpenAdverts { get; set; }
    public int CompletedAdverts { get; set; }
    public int TotalOffers { get; set; }
    public int PendingComplaints { get; set; }

    // Grafik verileri
    public IEnumerable<MonthlyCountDto> MonthlyUserRegistrations { get; set; } = [];
    public IEnumerable<MonthlyCountDto> MonthlyAdvertCreations { get; set; } = [];
    public IEnumerable<CityCountDto>   TopCitiesByAdverts { get; set; } = [];
    public IEnumerable<TopCarrierDto>  TopRatedCarriers { get; set; } = [];
}

public record MonthlyCountDto(string Month, int Count);
public record CityCountDto(string City, int Count);
public record TopCarrierDto(string Name, decimal Rating, int RatingCount);
