using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProfileBySlug(string slug)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Slug == slug);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [Authorize]
    [HttpPut("{slug}")]
    public async Task<IActionResult> UpdateProfileBySlug(string slug, [FromBody] UserProfile updatedProfile)
    {
        var existing = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Slug == slug);
        if (existing == null) return NotFound();

        existing.Name = updatedProfile.Name;
        existing.Role = updatedProfile.Role;
        existing.Bio = updatedProfile.Bio;
        existing.PhotoUrl = updatedProfile.PhotoUrl;
        existing.CvUrl = updatedProfile.CvUrl;
        existing.Email = updatedProfile.Email;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
