namespace Portfolio.Api.Models.Dtos;

public record TagRequest(string Name, string Color, string? IconKey, string? CustomIconUrl);
