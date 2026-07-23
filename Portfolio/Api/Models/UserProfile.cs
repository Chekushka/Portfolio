namespace Portfolio.Api.Models;

public class UserProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public string CvUrl { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = "unity";
    public string? ProjectsStatLabel { get; set; }
    public string? Stat2Label { get; set; }
    public string? Stat2Value { get; set; }
    public string? Stat3Label { get; set; }
    public string? Stat3Value { get; set; }
}
