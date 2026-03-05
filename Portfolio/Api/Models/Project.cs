namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Platform { get; set; } = "Google Play";
    public string Genre { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
}