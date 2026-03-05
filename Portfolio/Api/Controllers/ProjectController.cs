using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;

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
        var projects = await _context.Projects.ToListAsync();
        return Ok(projects);
    }
    
    [HttpPost]
    public async Task<IActionResult> AddProject([FromBody] Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProjects), new { id = project.Id }, project);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        // Шукаємо проєкт у базі за його ID
        var project = await _context.Projects.FindAsync(id);

        // Якщо не знайшли — повертаємо 404
        if (project == null)
        {
            return NotFound();
        }

        // Видаляємо об'єкт із контексту та зберігаємо зміни
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent(); // Статус 204
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] Project updatedProject)
    {
        if (id != updatedProject.Id)
        {
            return BadRequest("ID у запиті та в об'єкті не збігаються");
        }

        // Кажемо Entity Framework, що цей об'єкт змінено
        _context.Entry(updatedProject).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Projects.Any(e => e.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent(); // 204 успішно оновлено
    }
}