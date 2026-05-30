namespace NakliyeApp.Application.DTOs.Admin;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalSenders { get; set; }
    public int TotalCarriers { get; set; }
    public int TotalAdverts { get; set; }
    public int OpenAdverts { get; set; }
    public int CompletedAdverts { get; set; }
    public int TotalOffers { get; set; }
    public int PendingComplaints { get; set; }
}
