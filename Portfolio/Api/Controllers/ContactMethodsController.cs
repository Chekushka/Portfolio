using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Models;
using Portfolio.Api.Models.Dtos;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactMethodsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactMethodsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetContactMethods()
    {
        var methods = await _context.ContactMethods.OrderBy(c => c.Order).ToListAsync();
        return Ok(methods.Select(ToResponse));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateContactMethod([FromBody] ContactMethodRequest request)
    {
        var count = await _context.ContactMethods.CountAsync();
        if (count >= 5)
            return BadRequest(new { error = new { code = "MAX_CONTACT_METHODS", message = "Maximum 5 contact methods allowed." } });

        var method = new ContactMethod
        {
            Label = request.Label,
            IconKey = request.IconKey,
            CustomIconUrl = request.CustomIconUrl,
            Url = request.Url,
            Order = request.Order
        };
        _context.ContactMethods.Add(method);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContactMethods), new { id = method.Id }, ToResponse(method));
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContactMethod(int id, [FromBody] ContactMethodRequest request)
    {
        var method = await _context.ContactMethods.FindAsync(id);
        if (method == null) return NotFound();

        method.Label = request.Label;
        method.IconKey = request.IconKey;
        method.CustomIconUrl = request.CustomIconUrl;
        method.Url = request.Url;
        method.Order = request.Order;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContactMethod(int id)
    {
        var method = await _context.ContactMethods.FindAsync(id);
        if (method == null) return NotFound();

        _context.ContactMethods.Remove(method);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderContactMethods([FromBody] int[] orderedIds)
    {
        var methods = await _context.ContactMethods.ToListAsync();
        var existingIds = methods.Select(m => m.Id).ToHashSet();
        var submittedIds = orderedIds.ToHashSet();

        if (!existingIds.SetEquals(submittedIds))
            return BadRequest(new { error = new { code = "INVALID_IDS", message = "Submitted IDs do not match existing contact methods." } });

        var methodMap = methods.ToDictionary(m => m.Id);
        for (var i = 0; i < orderedIds.Length; i++)
            methodMap[orderedIds[i]].Order = i;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ContactMethodResponse ToResponse(ContactMethod m) =>
        new(m.Id, m.Label, m.IconKey, m.CustomIconUrl, m.Url, m.Order);
}
