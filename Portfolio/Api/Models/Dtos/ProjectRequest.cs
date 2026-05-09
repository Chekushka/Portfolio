namespace Portfolio.Api.Models.Dtos;

public class ProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string VideoLayout { get; set; } = "above";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
    public string? PreviewImageUrl { get; set; }
    public List<int> TagIds { get; set; } = new();
}
