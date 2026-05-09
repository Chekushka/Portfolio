namespace Portfolio.Api.Models;

public class ContactMethod
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? IconKey { get; set; }
    public string? CustomIconUrl { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
}
