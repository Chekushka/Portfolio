# Project Editing Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a markdown-based rich text editor for project descriptions, a flexible color-tagged system replacing platform/genre, and a per-project video layout toggle (above/side) managed in admin and rendered on the home page modal.

**Architecture:** Backend gains `Tag` entity with EF Core many-to-many to `Project`, a new `TagsController`, and DTOs replacing direct entity binding. Frontend gains a `MarkdownEditorComponent` (ControlValueAccessor), `TagService`, a tabbed `AdminComponent`, and updated `HomeComponent` rendering markdown + colored tags + layout-aware video.

**Tech Stack:** ASP.NET Core 8, EF Core + SQLite, Angular 21 standalone components, Reactive Forms, Angular signals, `ngx-markdown` (new dep), Vitest

---

## File Structure

**Backend — new:**
- `Portfolio/Api/Models/Tag.cs`
- `Portfolio/Api/Models/Dtos/TagDto.cs`
- `Portfolio/Api/Models/Dtos/ProjectRequest.cs`
- `Portfolio/Api/Models/Dtos/ProjectResponse.cs`
- `Portfolio/Api/Controllers/TagsController.cs`

**Backend — modified:**
- `Portfolio/Api/Models/Project.cs` — remove Platform/Genre, add VideoLayout + Tags nav
- `Portfolio/Api/Data/AppDbContext.cs` — add Tag DbSet, configure many-to-many
- `Portfolio/Api/Controllers/ProjectController.cs` — use DTOs, Include tags

**Frontend — new:**
- `Portfolio-Client/src/app/services/tag.service.ts`
- `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.ts`
- `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.html`
- `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.scss`

**Frontend — modified:**
- `Portfolio-Client/src/app/app.config.ts` — provideMarkdown(), fix duplicate provideHttpClient()
- `Portfolio-Client/src/app/config/api.config.ts` — add tags endpoint
- `Portfolio-Client/src/app/services/project.service.ts` — typed Project/ProjectRequest interfaces
- `Portfolio-Client/src/app/components/home/home.component.ts` — updated Project interface, MarkdownModule import
- `Portfolio-Client/src/app/components/home/home.component.html` — markdown render, tags loop, video layout
- `Portfolio-Client/src/app/components/admin/admin.component.ts` — tabs, TagService, tag form, updated project form
- `Portfolio-Client/src/app/components/admin/admin.component.html` — tab nav, tag management, markdown editor, video toggle

---

## Task 1: Backend — Tag model + Project model update

**Files:**
- Create: `Portfolio/Api/Models/Tag.cs`
- Modify: `Portfolio/Api/Models/Project.cs`

- [ ] **Step 1: Create `Tag.cs`**

```csharp
// Portfolio/Api/Models/Tag.cs
namespace Portfolio.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffffff";
}
```

- [ ] **Step 2: Replace `Project.cs` content**

```csharp
// Portfolio/Api/Models/Project.cs
namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string VideoLayout { get; set; } = "above";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
    public string? PreviewImageUrl { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
```

- [ ] **Step 3: Build to confirm no compile errors**

Run from `Portfolio/` directory:
```
dotnet build
```
Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 4: Commit**

```
git add Portfolio/Api/Models/Tag.cs Portfolio/Api/Models/Project.cs
git commit -m "feat(backend): add Tag model, remove platform/genre from Project, add VideoLayout"
```

---

## Task 2: Backend — DTOs

**Files:**
- Create: `Portfolio/Api/Models/Dtos/TagDto.cs`
- Create: `Portfolio/Api/Models/Dtos/ProjectRequest.cs`
- Create: `Portfolio/Api/Models/Dtos/ProjectResponse.cs`

- [ ] **Step 1: Create `TagDto.cs`**

```csharp
// Portfolio/Api/Models/Dtos/TagDto.cs
namespace Portfolio.Api.Models.Dtos;

public class TagDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#ffffff";
}
```

- [ ] **Step 2: Create `ProjectRequest.cs`**

```csharp
// Portfolio/Api/Models/Dtos/ProjectRequest.cs
namespace Portfolio.Api.Models.Dtos;

public class ProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string VideoLayout { get; set; } = "above";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
    public string? PreviewImageUrl { get; set; }
    public List<int> TagIds { get; set; } = new();
}
```

- [ ] **Step 3: Create `ProjectResponse.cs`**

```csharp
// Portfolio/Api/Models/Dtos/ProjectResponse.cs
namespace Portfolio.Api.Models.Dtos;

public class ProjectResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Downloads { get; set; } = "0";
    public string VideoLayout { get; set; } = "above";
    public string? VideoUrl { get; set; }
    public string? MarketLink { get; set; }
    public string? PreviewImageUrl { get; set; }
    public List<TagDto> Tags { get; set; } = new();
}
```

- [ ] **Step 4: Build**

```
dotnet build
```
Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 5: Commit**

```
git add Portfolio/Api/Models/Dtos/
git commit -m "feat(backend): add project and tag DTOs"
```

---

## Task 3: Backend — AppDbContext update + EF migration

**Files:**
- Modify: `Portfolio/Api/Data/AppDbContext.cs`

- [ ] **Step 1: Replace `AppDbContext.cs` content**

```csharp
// Portfolio/Api/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<UserProfile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags)
            .WithMany()
            .UsingEntity(j => j.ToTable("ProjectTags"));

        modelBuilder.Entity<UserProfile>().HasData(new UserProfile
        {
            Id = 1,
            Name = "Serhio",
            Role = "Software & Unity Developer",
            Bio = "I build immersive experiences...",
            PhotoUrl = "https://placehold.co/400x400/10b981/white?text=S",
            CvUrl = "#",
            Email = "hello@example.com"
        });
    }
}
```

- [ ] **Step 2: Add EF migration**

Run from `Portfolio/` directory:
```
dotnet ef migrations add AddTagsAndVideoLayout
```
Expected: a new file appears in `Migrations/` folder with `AddTagsAndVideoLayout` in the name.

- [ ] **Step 3: Apply migration**

```
dotnet ef database update
```
Expected: `Done.`

- [ ] **Step 4: Commit**

```
git add Portfolio/Api/Data/AppDbContext.cs Portfolio/Migrations/
git commit -m "feat(backend): configure Tag many-to-many, add migration AddTagsAndVideoLayout"
```

---

## Task 4: Backend — ProjectController update

**Files:**
- Modify: `Portfolio/Api/Controllers/ProjectController.cs`

- [ ] **Step 1: Replace `ProjectController.cs` content**

```csharp
// Portfolio/Api/Controllers/ProjectController.cs
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
```

- [ ] **Step 2: Build**

```
dotnet build
```
Expected: `Build succeeded. 0 Error(s)`

- [ ] **Step 3: Commit**

```
git add Portfolio/Api/Controllers/ProjectController.cs
git commit -m "feat(backend): ProjectController uses DTOs and includes tags"
```

---

## Task 5: Backend — TagsController

**Files:**
- Create: `Portfolio/Api/Controllers/TagsController.cs`

- [ ] **Step 1: Create `TagsController.cs`**

```csharp
// Portfolio/Api/Controllers/TagsController.cs
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
        return Ok(tags.Select(t => new TagDto { Id = t.Id, Name = t.Name, Color = t.Color }));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] TagDto request)
    {
        var tag = new Tag { Name = request.Name, Color = request.Color };
        _context.Tags.Add(tag);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTags), new { id = tag.Id },
            new TagDto { Id = tag.Id, Name = tag.Name, Color = tag.Color });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] TagDto request)
    {
        var tag = await _context.Tags.FindAsync(id);
        if (tag == null) return NotFound();

        tag.Name = request.Name;
        tag.Color = request.Color;
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
```

- [ ] **Step 2: Build and start API to verify endpoints exist**

```
dotnet build
dotnet run
```

Navigate to `http://localhost:5177/api/Tags` — should return `[]` (empty array).
Stop the server (Ctrl+C).

- [ ] **Step 3: Commit**

```
git add Portfolio/Api/Controllers/TagsController.cs
git commit -m "feat(backend): add TagsController with CRUD endpoints"
```

---

## Task 6: Frontend — Install ngx-markdown, update app.config.ts

**Files:**
- Modify: `Portfolio-Client/src/app/app.config.ts`

- [ ] **Step 1: Install ngx-markdown**

Run from `Portfolio-Client/` directory:
```
npm install ngx-markdown
```
Expected: package added to `package.json` dependencies.

- [ ] **Step 2: Replace `app.config.ts` content**

```typescript
// Portfolio-Client/src/app/app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideMarkdown()
  ]
};
```

Note: the original file had two `provideHttpClient()` calls — the duplicate is removed here.

- [ ] **Step 3: Verify app compiles**

```
ng build --configuration development
```
Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```
git add Portfolio-Client/src/app/app.config.ts Portfolio-Client/package.json Portfolio-Client/package-lock.json
git commit -m "feat(frontend): install ngx-markdown, configure provideMarkdown in app.config"
```

---

## Task 7: Frontend — api.config.ts + TagService

**Files:**
- Modify: `Portfolio-Client/src/app/config/api.config.ts`
- Create: `Portfolio-Client/src/app/services/tag.service.ts`
- Test: `Portfolio-Client/src/app/services/tag.service.spec.ts`

- [ ] **Step 1: Update `api.config.ts`**

```typescript
// Portfolio-Client/src/app/config/api.config.ts
import { environment } from '../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.baseUrl,
  endpoints: {
    project: 'Project',
    auth: 'auth',
    profile: 'profile',
    tags: 'Tags'
  }
};
```

- [ ] **Step 2: Write the failing test**

```typescript
// Portfolio-Client/src/app/services/tag.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TagService } from './tag.service';
import { API_CONFIG } from '../config/api.config';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.tags}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getTags sends GET and returns tag array', () => {
    const mock = [{ id: 1, name: 'Unity', color: '#3b82f6' }];
    service.getTags().subscribe(tags => expect(tags).toEqual(mock));
    httpMock.expectOne(baseUrl).flush(mock);
  });

  it('createTag sends POST and returns created tag', () => {
    const payload = { name: 'Unity', color: '#3b82f6' };
    service.createTag(payload).subscribe(tag => expect(tag.id).toBe(1));
    const req = httpMock.expectOne({ method: 'POST', url: baseUrl });
    req.flush({ id: 1, ...payload });
  });

  it('updateTag sends PUT to /Tags/:id', () => {
    service.updateTag(1, { name: 'Updated', color: '#ff0000' }).subscribe();
    httpMock.expectOne({ method: 'PUT', url: `${baseUrl}/1` }).flush(null);
  });

  it('deleteTag sends DELETE to /Tags/:id', () => {
    service.deleteTag(1).subscribe();
    httpMock.expectOne({ method: 'DELETE', url: `${baseUrl}/1` }).flush(null);
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```
npx vitest run src/app/services/tag.service.spec.ts
```
Expected: FAIL — `Cannot find module './tag.service'`

- [ ] **Step 4: Create `tag.service.ts`**

```typescript
// Portfolio-Client/src/app/services/tag.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.tags}`;

  getTags() {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  createTag(tag: Omit<Tag, 'id'>) {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: Omit<Tag, 'id'>) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { id, ...tag });
  }

  deleteTag(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

- [ ] **Step 5: Run test to confirm it passes**

```
npx vitest run src/app/services/tag.service.spec.ts
```
Expected: 4 tests PASS

- [ ] **Step 6: Commit**

```
git add Portfolio-Client/src/app/config/api.config.ts Portfolio-Client/src/app/services/tag.service.ts Portfolio-Client/src/app/services/tag.service.spec.ts
git commit -m "feat(frontend): add TagService with CRUD methods and tests"
```

---

## Task 8: Frontend — MarkdownEditorComponent

**Files:**
- Create: `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.ts`
- Create: `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.html`
- Create: `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.scss`
- Test: `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';

describe('MarkdownEditorComponent', () => {
  let fixture: ComponentFixture<MarkdownEditorComponent>;
  let component: MarkdownEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownEditorComponent],
      providers: [provideHttpClient(), provideMarkdown()]
    }).compileComponents();
    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue sets value', () => {
    component.writeValue('**hello**');
    expect(component.value).toBe('**hello**');
  });

  it('writeValue treats null as empty string', () => {
    component.writeValue(null as any);
    expect(component.value).toBe('');
  });

  it('toggles to preview mode', () => {
    component.isPreviewing = true;
    fixture.detectChanges();
    const preview = fixture.nativeElement.querySelector('.md-preview');
    expect(preview).toBeTruthy();
  });

  it('shows textarea in edit mode', () => {
    component.isPreviewing = false;
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```
npx vitest run src/app/components/markdown-editor/markdown-editor.component.spec.ts
```
Expected: FAIL — `Cannot find module './markdown-editor.component'`

- [ ] **Step 3: Create `markdown-editor.component.ts`**

```typescript
// Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.ts
import { Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MarkdownEditorComponent),
    multi: true
  }]
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  value = '';
  isPreviewing = false;
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
    this.onTouched();
  }

  insert(before: string, after = ''): void {
    const el = this.textareaRef.nativeElement;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = this.value.substring(start, end) || 'text';
    const inserted = `${before}${selected}${after}`;
    this.value = this.value.substring(0, start) + inserted + this.value.substring(end);
    this.onChange(this.value);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
}
```

- [ ] **Step 4: Create `markdown-editor.component.html`**

```html
<!-- Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.html -->
<div class="md-editor">
  <div class="md-toolbar">
    <button type="button" (click)="insert('**', '**')" title="Bold"><strong>B</strong></button>
    <button type="button" (click)="insert('_', '_')" title="Italic"><em>I</em></button>
    <button type="button" (click)="insert('\n- ')" title="Unordered list">&#8226;&#8212;</button>
    <button type="button" (click)="insert('\n1. ')" title="Ordered list">1.</button>
    <button type="button" (click)="insert('`', '`')" title="Inline code">`&nbsp;`</button>
    <button type="button" (click)="insert('\n```\n', '\n```')" title="Code block">{ }</button>
    <button type="button" (click)="insert('[', '](url)')" title="Link">&#128279;</button>
    <span class="md-spacer"></span>
    <button type="button" class="md-toggle" (click)="isPreviewing = !isPreviewing">
      {{ isPreviewing ? 'Edit' : 'Preview' }}
    </button>
  </div>

  @if (!isPreviewing) {
    <textarea
      #textarea
      class="md-textarea"
      [value]="value"
      (input)="onInput($event)"
      rows="8"
      placeholder="Write description in Markdown...">
    </textarea>
  } @else {
    <div class="md-preview">
      <markdown [data]="value" />
    </div>
  }
</div>
```

- [ ] **Step 5: Create `markdown-editor.component.scss`**

```scss
.md-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border, #374151);
  border-radius: 6px;
  overflow: hidden;
}

.md-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--surface-2, #1f2937);
  border-bottom: 1px solid var(--border, #374151);
  flex-wrap: wrap;

  button {
    min-width: 32px;
    height: 28px;
    padding: 0 6px;
    background: var(--surface-3, #374151);
    color: var(--text, #f9fafb);
    border: 1px solid var(--border, #4b5563);
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    line-height: 1;

    &:hover {
      background: var(--surface-4, #4b5563);
    }
  }
}

.md-spacer {
  flex: 1;
}

.md-toggle {
  font-size: 0.75rem !important;
  padding: 0 10px !important;
}

.md-textarea {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  background: var(--surface-1, #111827);
  color: var(--text, #f9fafb);
  border: none;
  resize: vertical;
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
}

.md-preview {
  min-height: 180px;
  padding: 12px;
  background: var(--surface-1, #111827);
  color: var(--text, #f9fafb);
  font-size: 0.875rem;
  line-height: 1.6;

  :deep(h1, h2, h3) { margin: 0.5em 0; }
  :deep(ul, ol) { padding-left: 1.5em; }
  :deep(code) {
    background: var(--surface-2, #1f2937);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.85em;
  }
  :deep(pre) {
    background: var(--surface-2, #1f2937);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
  :deep(a) { color: var(--accent, #10b981); }
}
```

- [ ] **Step 6: Run tests**

```
npx vitest run src/app/components/markdown-editor/markdown-editor.component.spec.ts
```
Expected: 4 tests PASS

- [ ] **Step 7: Commit**

```
git add Portfolio-Client/src/app/components/markdown-editor/
git commit -m "feat(frontend): add MarkdownEditorComponent with toolbar and preview"
```

---

## Task 9: Frontend — ProjectService typed update

**Files:**
- Modify: `Portfolio-Client/src/app/services/project.service.ts`

- [ ] **Step 1: Replace `project.service.ts` content**

```typescript
// Portfolio-Client/src/app/services/project.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { Tag } from './tag.service';

export interface Project {
  id: number;
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  videoUrl?: string;
  marketLink?: string;
  previewImageUrl?: string;
  tags: Tag[];
}

export interface ProjectRequest {
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  videoUrl?: string;
  marketLink?: string;
  previewImageUrl?: string;
  tagIds: number[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  getProjects() {
    return this.http.get<Project[]>(this.apiUrl);
  }

  addProject(project: ProjectRequest) {
    return this.http.post<Project>(this.apiUrl, project);
  }

  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, project: ProjectRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }
}
```

- [ ] **Step 2: Commit**

```
git add Portfolio-Client/src/app/services/project.service.ts
git commit -m "refactor(frontend): type ProjectService with Project and ProjectRequest interfaces"
```

---

## Task 10: Frontend — HomeComponent update

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.ts`
- Modify: `Portfolio-Client/src/app/components/home/home.component.html`

- [ ] **Step 1: Update `home.component.ts`**

Replace the `Project` interface and add `MarkdownModule` to imports. The rest of the component logic stays the same.

Replace the imports block and `Project` interface at the top of the file:

```typescript
import { Component, HostListener, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MarkdownModule } from 'ngx-markdown';
import { Tag } from '../../services/tag.service';

interface Project {
  id: number;
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  previewImageUrl?: string;
  videoUrl?: string;
  marketLink?: string;
  tags: Tag[];
}
```

In the `@Component` decorator, update the `imports` array:
```typescript
imports: [CommonModule, SafeUrlPipe, MarkdownModule],
```

- [ ] **Step 2: Update project card tags in `home.component.html`**

Find and replace this block (inside the project card `@for` loop):

**Before:**
```html
            <div class="card-tags">
              @if (p.platform) {
                <span class="ctag cyan">{{ p.platform }}</span>
              }
              @if (p.genre) {
                <span class="ctag pink">{{ p.genre }}</span>
              }
            </div>
```

**After:**
```html
            <div class="card-tags">
              @for (tag of p.tags; track tag.id) {
                <span class="ctag" [style.background-color]="tag.color">{{ tag.name }}</span>
              }
            </div>
```

- [ ] **Step 3: Update modal video + description section in `home.component.html`**

Find and replace the video/image block (inside `@if (selectedProject(); as proj)`):
```html
        @if (proj.videoUrl) {
          <div class="modal-media">
            <iframe
              [src]="proj.videoUrl | safeUrl"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              style="width: 100%; aspect-ratio: 16/9"
              [title]="proj.name + ' gameplay video'"
            ></iframe>
          </div>
        } @else if (proj.previewImageUrl) {
          <img [src]="proj.previewImageUrl" [alt]="proj.name" class="modal-img" />
        }
```

**Replace with** this layout-aware block:
```html
        @if (proj.videoUrl) {
          <div [class]="proj.videoLayout === 'side' ? 'modal-layout-side' : 'modal-layout-above'">
            <div class="modal-media">
              <iframe
                [src]="proj.videoUrl | safeUrl"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                style="width: 100%; aspect-ratio: 16/9"
                [title]="proj.name + ' gameplay video'"
              ></iframe>
            </div>
            <div class="modal-desc">
              <markdown [data]="proj.description" />
            </div>
          </div>
        } @else {
          @if (proj.previewImageUrl) {
            <img [src]="proj.previewImageUrl" [alt]="proj.name" class="modal-img" />
          }
          <div class="modal-desc">
            <markdown [data]="proj.description" />
          </div>
        }
```

Then find and **remove** this line entirely (description now renders inside the layout block above):
```html
          <p class="modal-desc">{{ proj.description }}</p>
```

- [ ] **Step 4: Update modal tags in `home.component.html`**

Find and replace this block:

**Before:**
```html
          <div class="modal-tags">
            @if (proj.platform) {
              <span class="mtag">📱 {{ proj.platform }}</span>
            }
            @if (proj.genre) {
              <span class="mtag">🎮 {{ proj.genre }}</span>
            }
            @if (proj.downloads) {
              <span class="mtag green">⬇️ {{ proj.downloads }}</span>
            }
          </div>
```

**After:**
```html
          <div class="modal-tags">
            @for (tag of proj.tags; track tag.id) {
              <span class="mtag" [style.background-color]="tag.color">{{ tag.name }}</span>
            }
            @if (proj.downloads) {
              <span class="mtag green">⬇️ {{ proj.downloads }}</span>
            }
          </div>
```

- [ ] **Step 5: Add layout CSS to `home.component.scss`**

Append to the end of `home.component.scss`:

```scss
.modal-layout-above {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .modal-media { width: 100%; }
}

.modal-layout-side {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: flex-start;

  .modal-media { flex: 0 0 50%; }
  .modal-desc { flex: 1; overflow-y: auto; max-height: 400px; }
}
```

- [ ] **Step 6: Build to verify no type errors**

```
ng build --configuration development
```
Expected: succeeds with no errors.

- [ ] **Step 7: Commit**

```
git add Portfolio-Client/src/app/components/home/
git commit -m "feat(frontend): HomeComponent renders markdown, colored tags, and video layout"
```

---

## Task 11: Frontend — AdminComponent update

**Files:**
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.ts`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.html`

- [ ] **Step 1: Replace `admin.component.ts` content**

```typescript
// Portfolio-Client/src/app/components/admin/admin.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectService, Project, ProjectRequest } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { TagService, Tag } from '../../services/tag.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownEditorComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private tagService = inject(TagService);

  activeTab = signal<'profile' | 'projects' | 'tags'>('projects');
  projects = signal<Project[]>([]);
  allTags = signal<Tag[]>([]);
  editingProjectId = signal<number | null>(null);
  editingTagId = signal<number | null>(null);
  selectedTagIds = signal<number[]>([]);
  isSubmittingProject = false;
  isSubmittingProfile = false;

  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
    bio: new FormControl(''),
    photoUrl: new FormControl(''),
    cvUrl: new FormControl(''),
    email: new FormControl('', Validators.email)
  });

  projectForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    downloads: new FormControl('0'),
    videoLayout: new FormControl('above'),
    videoUrl: new FormControl(''),
    marketLink: new FormControl(''),
    previewImageUrl: new FormControl('')
  });

  tagForm = new FormGroup({
    name: new FormControl('', Validators.required),
    color: new FormControl('#3b82f6', Validators.required)
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadProfile();
    this.loadTags();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data) => { if (data) this.profileForm.patchValue(data); },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  loadTags() {
    this.tagService.getTags().subscribe({
      next: (data) => this.allTags.set(data),
      error: (err) => console.error('Failed to load tags', err)
    });
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || this.isSubmittingProfile) return;
    this.isSubmittingProfile = true;
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => { alert('Profile updated successfully!'); this.isSubmittingProfile = false; },
      error: () => { this.isSubmittingProfile = false; }
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || this.isSubmittingProject) return;
    this.isSubmittingProject = true;
    const id = this.editingProjectId();
    const projectData: ProjectRequest = {
      ...(this.projectForm.value as Omit<ProjectRequest, 'tagIds'>),
      tagIds: this.selectedTagIds()
    };

    if (id) {
      this.projectService.updateProject(id, projectData).subscribe({
        next: () => { this.loadProjects(); this.cancelEdit(); this.isSubmittingProject = false; },
        error: () => { this.isSubmittingProject = false; }
      });
    } else {
      this.projectService.addProject(projectData).subscribe({
        next: (newProject) => {
          this.projects.update(items => [...items, newProject]);
          this.cancelEdit();
          this.isSubmittingProject = false;
        },
        error: () => { this.isSubmittingProject = false; }
      });
    }
  }

  editProject(project: Project) {
    this.editingProjectId.set(project.id);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      downloads: project.downloads,
      videoLayout: project.videoLayout,
      videoUrl: project.videoUrl,
      marketLink: project.marketLink,
      previewImageUrl: project.previewImageUrl
    });
    this.selectedTagIds.set(project.tags.map(t => t.id));
    this.activeTab.set('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProjectId.set(null);
    this.selectedTagIds.set([]);
    this.projectForm.reset({ downloads: '0', videoLayout: 'above' });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.projects.update(items => items.filter(p => p.id !== id)),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  toggleTag(id: number) {
    this.selectedTagIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  onTagSubmit() {
    if (this.tagForm.invalid) return;
    const { name, color } = this.tagForm.value as { name: string; color: string };
    const id = this.editingTagId();
    if (id) {
      this.tagService.updateTag(id, { name, color }).subscribe({
        next: () => {
          this.allTags.update(tags => tags.map(t => t.id === id ? { id, name, color } : t));
          this.cancelTagEdit();
        }
      });
    } else {
      this.tagService.createTag({ name, color }).subscribe({
        next: (tag) => {
          this.allTags.update(tags => [...tags, tag]);
          this.tagForm.reset({ color: '#3b82f6' });
        }
      });
    }
  }

  editTag(tag: Tag) {
    this.editingTagId.set(tag.id);
    this.tagForm.patchValue({ name: tag.name, color: tag.color });
  }

  cancelTagEdit() {
    this.editingTagId.set(null);
    this.tagForm.reset({ color: '#3b82f6' });
  }

  deleteTag(id: number) {
    if (confirm('Delete this tag? It will be removed from all projects.')) {
      this.tagService.deleteTag(id).subscribe({
        next: () => {
          this.allTags.update(tags => tags.filter(t => t.id !== id));
          this.selectedTagIds.update(ids => ids.filter(i => i !== id));
          this.loadProjects();
        }
      });
    }
  }
}
```

- [ ] **Step 2: Replace `admin.component.html` content**

```html
<!-- Portfolio-Client/src/app/components/admin/admin.component.html -->
<div class="admin-container">

  <nav class="admin-tabs">
    <button [class.active]="activeTab() === 'projects'" (click)="activeTab.set('projects')">Projects</button>
    <button [class.active]="activeTab() === 'tags'" (click)="activeTab.set('tags')">Tags</button>
    <button [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Profile</button>
  </nav>

  <!-- ===== PROFILE TAB ===== -->
  @if (activeTab() === 'profile') {
    <section class="form-section">
      <h2>Profile Settings</h2>
      <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
        <div class="form-row">
          <input formControlName="name" placeholder="Your Name *">
          <input formControlName="role" placeholder="Your Role (e.g., Unity Developer) *">
        </div>
        <div class="form-row">
          <input formControlName="email" placeholder="Contact Email">
          <input formControlName="cvUrl" placeholder="Link to CV (Google Drive/PDF)">
        </div>
        <div class="form-row">
          <input formControlName="photoUrl" placeholder="Link to Profile Photo">
        </div>
        <textarea formControlName="bio" placeholder="Short Bio about yourself..." rows="3"></textarea>
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || isSubmittingProfile">
            Save Profile Settings
          </button>
        </div>
      </form>
    </section>
  }

  <!-- ===== PROJECTS TAB ===== -->
  @if (activeTab() === 'projects') {
    <section class="form-section">
      <h2>{{ editingProjectId() ? 'Edit Project' : 'Add New Project' }}</h2>
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <input formControlName="name" placeholder="Project Name *">
          <input formControlName="downloads" placeholder="Downloads count">
        </div>
        <div class="form-row">
          <input formControlName="previewImageUrl" placeholder="Preview Image URL (.jpg, .png)">
          <input formControlName="videoUrl" placeholder="Direct Video URL (.mp4)">
        </div>
        <div class="form-row">
          <input formControlName="marketLink" placeholder="Link to Store (Google Play, App Store, etc.)">
        </div>

        <div class="form-field">
          <label class="field-label">Video Layout</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" formControlName="videoLayout" value="above">
              Video above description
            </label>
            <label class="radio-label">
              <input type="radio" formControlName="videoLayout" value="side">
              Video beside description
            </label>
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">Tags</label>
          <div class="tag-select">
            @if (allTags().length === 0) {
              <span class="empty-hint">No tags yet — create some in the Tags tab.</span>
            }
            @for (tag of allTags(); track tag.id) {
              <button
                type="button"
                class="tag-chip"
                [class.selected]="selectedTagIds().includes(tag.id)"
                [style.--tag-color]="tag.color"
                (click)="toggleTag(tag.id)">
                {{ tag.name }}
              </button>
            }
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">Description (Markdown)</label>
          <app-markdown-editor formControlName="description" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="projectForm.invalid || isSubmittingProject">
            {{ editingProjectId() ? 'Update Project' : 'Save Project' }}
          </button>
          @if (editingProjectId()) {
            <button type="button" class="btn-cancel" (click)="cancelEdit()">Cancel</button>
          }
        </div>
      </form>
    </section>

    <section class="list-section">
      <h2>Projects List</h2>
      <div class="admin-list">
        @if (projects().length === 0) {
          <p class="empty-state">No projects yet. Add your first project above!</p>
        } @else {
          @for (project of projects(); track project.id) {
            <div class="admin-card">
              <div class="project-info">
                <h3>{{ project.name }}</h3>
                <div class="project-tag-list">
                  @for (tag of project.tags; track tag.id) {
                    <span class="tag-badge" [style.background-color]="tag.color">{{ tag.name }}</span>
                  }
                </div>
                <p class="meta">{{ project.downloads }} downloads • {{ project.videoLayout }} layout</p>
              </div>
              <div class="actions">
                <button class="btn-edit" (click)="editProject(project)">Edit</button>
                <button class="btn-delete" (click)="deleteProject(project.id)">Delete</button>
              </div>
            </div>
          }
        }
      </div>
    </section>
  }

  <!-- ===== TAGS TAB ===== -->
  @if (activeTab() === 'tags') {
    <section class="form-section">
      <h2>{{ editingTagId() ? 'Edit Tag' : 'Create Tag' }}</h2>
      <form [formGroup]="tagForm" (ngSubmit)="onTagSubmit()">
        <div class="form-row">
          <input formControlName="name" placeholder="Tag name *">
          <div class="color-field">
            <label class="field-label">Color</label>
            <input type="color" formControlName="color" class="color-input">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="tagForm.invalid">
            {{ editingTagId() ? 'Update Tag' : 'Save Tag' }}
          </button>
          @if (editingTagId()) {
            <button type="button" class="btn-cancel" (click)="cancelTagEdit()">Cancel</button>
          }
        </div>
      </form>
    </section>

    <section class="list-section">
      <h2>Tags Library</h2>
      <div class="admin-list">
        @if (allTags().length === 0) {
          <p class="empty-state">No tags yet. Create your first tag above!</p>
        } @else {
          @for (tag of allTags(); track tag.id) {
            <div class="admin-card">
              <div class="tag-info">
                <span class="tag-swatch" [style.background-color]="tag.color"></span>
                <span class="tag-name">{{ tag.name }}</span>
              </div>
              <div class="actions">
                <button class="btn-edit" (click)="editTag(tag)">Edit</button>
                <button class="btn-delete" (click)="deleteTag(tag.id)">Delete</button>
              </div>
            </div>
          }
        }
      </div>
    </section>
  }

</div>
```

- [ ] **Step 3: Add admin-specific styles to `admin.component.scss`**

Append to the end of `admin.component.scss`:

```scss
.admin-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border, #374151);
  padding-bottom: 0;

  button {
    padding: 8px 20px;
    background: transparent;
    color: var(--text-muted, #9ca3af);
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: -1px;

    &:hover { color: var(--text, #f9fafb); }

    &.active {
      color: var(--text, #f9fafb);
      border-bottom-color: var(--accent, #10b981);
    }
  }
}

.field-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-field {
  margin-bottom: 1rem;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text, #f9fafb);
  font-size: 0.875rem;
}

.tag-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
}

.tag-chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 2px solid var(--tag-color, #6b7280);
  background: transparent;
  color: var(--text, #f9fafb);
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.15s;

  &.selected {
    background: var(--tag-color, #6b7280);
    color: #fff;
  }

  &:hover { opacity: 0.85; }
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #9ca3af);
}

.project-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 4px 0;
}

.tag-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #fff;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
  flex-shrink: 0;
}

.tag-name {
  font-weight: 500;
}

.color-field {
  display: flex;
  flex-direction: column;
}

.color-input {
  width: 60px;
  height: 38px;
  padding: 2px;
  border-radius: 4px;
  border: 1px solid var(--border, #374151);
  background: transparent;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 20px;
  background: var(--accent, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.btn-edit {
  padding: 6px 14px;
  background: var(--surface-3, #374151);
  color: var(--text, #f9fafb);
  border: 1px solid var(--border, #4b5563);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover { background: var(--surface-4, #4b5563); }
}

.btn-delete {
  padding: 6px 14px;
  background: #7f1d1d;
  color: #fca5a5;
  border: 1px solid #991b1b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover { background: #991b1b; }
}

.btn-cancel {
  padding: 8px 20px;
  background: transparent;
  color: var(--text-muted, #9ca3af);
  border: 1px solid var(--border, #374151);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover { color: var(--text, #f9fafb); border-color: var(--text-muted, #9ca3af); }
}
```

- [ ] **Step 4: Build to verify no type or template errors**

```
ng build --configuration development
```
Expected: build succeeds.

- [ ] **Step 5: Commit**

```
git add Portfolio-Client/src/app/components/admin/
git commit -m "feat(frontend): AdminComponent with tabs, tag management, markdown editor, video layout toggle"
```

---

## Task 12: End-to-End verification

- [ ] **Step 1: Start the backend**

From `Portfolio/` directory:
```
dotnet run
```
Expected: `Now listening on: http://localhost:5177`

- [ ] **Step 2: Start the frontend**

From `Portfolio-Client/` directory:
```
ng serve
```
Expected: `Application bundle generation complete. http://localhost:4200`

- [ ] **Step 3: Verify tags flow**

1. Go to `http://localhost:4200/admin`, log in.
2. Click "Tags" tab.
3. Create two tags: e.g., `Unity` with color `#3b82f6` and `Mobile` with color `#10b981`.
4. Verify both appear in the tag list with color swatches.

- [ ] **Step 4: Verify project creation with tags and markdown**

1. Click "Projects" tab.
2. Fill in a project name, type markdown description: `**Bold text** and _italic_ with a list:\n- Item 1\n- Item 2`
3. Click "Preview" button in the markdown editor — verify formatted output.
4. Select both tags (chips should highlight).
5. Set video layout to "Video beside description".
6. Save.
7. Go to `http://localhost:4200` — project card should show colored tags.
8. Click the project — modal should show the "side" layout (if videoUrl set) and markdown rendered.

- [ ] **Step 5: Verify edit preserves tags and layout**

1. In admin, click Edit on the project.
2. Verify tags are pre-selected, layout radio is pre-set.
3. Change layout to "above", remove one tag, save.
4. Check home page modal reflects the change.

- [ ] **Step 6: Run all frontend tests**

```
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 7: Final commit**

```
git add -A
git commit -m "chore: end-to-end verification complete"
```
