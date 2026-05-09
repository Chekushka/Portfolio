using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Models.Dtos;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _context.Projects
            .Include(p => p.Tags)
            .ToListAsync();

        var response = projects.Select(p => new ProjectResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Downloads = p.Downloads,
            VideoLayout = p.VideoLayout,
            VideoUrl = p.VideoUrl,
            MarketLink = p.MarketLink,
            PreviewImageUrl = p.PreviewImageUrl,
            Tags = p.Tags.Select(t => new TagDto { Id = t.Id, Name = t.Name, Color = t.Color }).ToList()
        });

        return Ok(response);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddProject([FromBody] ProjectRequest request)
    {
        var tags = await _context.Tags
            .Where(t => request.TagIds.Contains(t.Id))
            .ToListAsync();

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            Downloads = request.Downloads,
            VideoLayout = request.VideoLayout,
            VideoUrl = request.VideoUrl,
            MarketLink = request.MarketLink,
            PreviewImageUrl = request.PreviewImageUrl,
            Tags = tags
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        var response = new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Downloads = project.Downloads,
            VideoLayout = project.VideoLayout,
            VideoUrl = project.VideoUrl,
            MarketLink = project.MarketLink,
            PreviewImageUrl = project.PreviewImageUrl,
            Tags = project.Tags.Select(t => new TagDto { Id = t.Id, Name = t.Name, Color = t.Color }).ToList()
        };

        return CreatedAtAction(nameof(GetProjects), new { id = project.Id }, response);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectRequest request)
    {
        var project = await _context.Projects
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();

        var tags = await _context.Tags
            .Where(t => request.TagIds.Contains(t.Id))
            .ToListAsync();

        project.Name = request.Name;
        project.Description = request.Description;
        project.Downloads = request.Downloads;
        project.VideoLayout = request.VideoLayout;
        project.VideoUrl = request.VideoUrl;
        project.MarketLink = request.MarketLink;
        project.PreviewImageUrl = request.PreviewImageUrl;
        project.Tags = tags;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
