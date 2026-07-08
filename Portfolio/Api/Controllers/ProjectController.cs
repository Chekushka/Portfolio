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
    public async Task<IActionResult> GetProjects([FromQuery] int? profileId)
    {
        var query = _context.Projects.Include(p => p.Tags).AsQueryable();
        if (profileId.HasValue)
            query = query.Where(p => p.ProfileId == profileId.Value);

        var projects = await query.OrderBy(p => p.Order).ToListAsync();

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
            ProfileId = p.ProfileId,
            Order = p.Order,
            Tags = p.Tags.Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Color = t.Color,
                IconKey = t.IconKey,
                CustomIconUrl = t.CustomIconUrl
            }).ToList()
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

        var maxOrder = await _context.Projects
            .Where(p => p.ProfileId == request.ProfileId)
            .MaxAsync(p => (int?)p.Order) ?? -1;

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            Downloads = request.Downloads,
            VideoLayout = request.VideoLayout,
            VideoUrl = request.VideoUrl,
            MarketLink = request.MarketLink,
            PreviewImageUrl = request.PreviewImageUrl,
            ProfileId = request.ProfileId,
            Order = maxOrder + 1,
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
            ProfileId = project.ProfileId,
            Order = project.Order,
            Tags = project.Tags.Select(t => new TagDto
            {
                Id = t.Id,
                Name = t.Name,
                Color = t.Color,
                IconKey = t.IconKey,
                CustomIconUrl = t.CustomIconUrl
            }).ToList()
        };

        return CreatedAtAction(nameof(GetProjects), new { id = project.Id }, response);
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
    [HttpPut("{id}/order")]
    public async Task<IActionResult> ReorderProject(int id, [FromBody] ReorderRequest request)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        var siblings = await _context.Projects
            .Include(p => p.Tags)
            .Where(p => p.ProfileId == project.ProfileId)
            .OrderBy(p => p.Order)
            .ToListAsync();

        if (request.Direction != "up" && request.Direction != "down")
            return BadRequest("Direction must be 'up' or 'down'.");

        var index = siblings.FindIndex(p => p.Id == id);
        var newIndex = index + (request.Direction == "up" ? -1 : 1);

        if (newIndex < 0 || newIndex >= siblings.Count)
            return BadRequest("Project is already at the boundary.");

        (siblings[index].Order, siblings[newIndex].Order) =
            (siblings[newIndex].Order, siblings[index].Order);

        await _context.SaveChangesAsync();

        var response = siblings.OrderBy(p => p.Order).Select(p => new ProjectResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Downloads = p.Downloads,
            VideoLayout = p.VideoLayout,
            VideoUrl = p.VideoUrl,
            MarketLink = p.MarketLink,
            PreviewImageUrl = p.PreviewImageUrl,
            ProfileId = p.ProfileId,
            Order = p.Order,
            Tags = p.Tags.Select(t => new TagDto
            {
                Id = t.Id, Name = t.Name, Color = t.Color,
                IconKey = t.IconKey, CustomIconUrl = t.CustomIconUrl
            }).ToList()
        });

        return Ok(response);
    }
}
