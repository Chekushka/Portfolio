using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Models.Dtos;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TagsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTags()
    {
        var tags = await _context.Tags.ToListAsync();
        return Ok(tags.Select(t => new TagDto
        {
            Id = t.Id,
            Name = t.Name,
            Color = t.Color,
            IconKey = t.IconKey,
            CustomIconUrl = t.CustomIconUrl
        }));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] TagRequest request)
    {
        var tag = new Tag
        {
            Name = request.Name,
            Color = request.Color,
            IconKey = request.IconKey,
            CustomIconUrl = request.CustomIconUrl
        };
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTags), new { id = tag.Id },
            new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                Color = tag.Color,
                IconKey = tag.IconKey,
                CustomIconUrl = tag.CustomIconUrl
            });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] TagRequest request)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        tag.Name = request.Name;
        tag.Color = request.Color;
        tag.IconKey = request.IconKey;
        tag.CustomIconUrl = request.CustomIconUrl;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        _context.Tags.Remove(tag);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
