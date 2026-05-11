namespace Portfolio.Api.Models.Dtos;

public record ContactMethodResponse(
    int Id,
    string Label,
    string? IconKey,
    string? CustomIconUrl,
    string Url,
    int Order
);
