namespace Portfolio.Api.Models.Dtos;

public record ContactMethodRequest(
    string Label,
    string? IconKey,
    string? CustomIconUrl,
    string Url,
    int Order
);
