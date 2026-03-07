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
}