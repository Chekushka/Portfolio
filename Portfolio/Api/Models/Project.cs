namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string VideoLayout { get; set; } = "above";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
    public string? PreviewImageUrl { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
