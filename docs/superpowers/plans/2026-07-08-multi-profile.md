# Multi-Profile Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a .NET developer profile at `/dotnet`, a split-screen chooser at `/`, project ordering with ↑↓ buttons, and a Minimal Monochrome theme — all managed from one admin panel.

**Architecture:** `UserProfile` gains `Slug`/`ThemeKey` columns; `Project` gains `ProfileId`/`Order`. A new `ProfilePageComponent` replaces `HomeComponent`, reads `:slug` from the route, and applies a CSS theme class to its host. A `ChooserComponent` at root renders a 50/50 split screen that expands on hover. The admin panel gains a profile switcher row above the existing content tabs.

**Tech Stack:** ASP.NET Core 8 / EF Core / SQLite (backend) · Angular 21 standalone components, signals, `inject()`, `HttpClient`, CSS `@keyframes` (frontend) · Vitest / Angular TestBed / HttpTestingController (tests)

---

## File Map

**Create:**
- `Portfolio/Api/Models/Dtos/ReorderRequest.cs`
- `Portfolio-Client/src/app/components/profile-page/profile-page.component.ts`
- `Portfolio-Client/src/app/components/profile-page/profile-page.component.html`
- `Portfolio-Client/src/app/components/profile-page/profile-page.component.scss`
- `Portfolio-Client/src/app/components/chooser/chooser.component.ts`
- `Portfolio-Client/src/app/components/chooser/chooser.component.html`
- `Portfolio-Client/src/app/components/chooser/chooser.component.scss`
- `Portfolio-Client/src/app/services/profile.service.spec.ts`
- `Portfolio-Client/src/app/services/project.service.spec.ts`

**Modify:**
- `Portfolio/Api/Models/UserProfile.cs` — add Slug, ThemeKey
- `Portfolio/Api/Models/Project.cs` — add ProfileId, Order
- `Portfolio/Api/Models/Dtos/ProjectRequest.cs` — add ProfileId
- `Portfolio/Api/Models/Dtos/ProjectResponse.cs` — add ProfileId, Order
- `Portfolio/Api/Data/AppDbContext.cs` — FK/index config, seed both profiles
- `Portfolio/Api/Controllers/ProfileController.cs` — add slug endpoints
- `Portfolio/Api/Controllers/ProjectController.cs` — add profileId filter, add order endpoint
- `Portfolio-Client/src/app/services/profile.service.ts` — typed interface, getBySlug, updateBySlug
- `Portfolio-Client/src/app/services/project.service.ts` — updated types, getByProfileId, reorderProject
- `Portfolio-Client/src/app/app.routes.ts` — replace HomeComponent routes
- `Portfolio-Client/src/app/components/admin/admin.component.ts` — profile switcher, ordering
- `Portfolio-Client/src/app/components/admin/admin.component.html` — profile switcher UI, order buttons

**Delete (after ProfilePageComponent is wired up):**
- `Portfolio-Client/src/app/components/home/home.component.ts`
- `Portfolio-Client/src/app/components/home/home.component.html`
- `Portfolio-Client/src/app/components/home/home.component.scss`

---

## Task 1: Backend Models

**Files:**
- Modify: `Portfolio/Api/Models/UserProfile.cs`
- Modify: `Portfolio/Api/Models/Project.cs`
- Modify: `Portfolio/Api/Models/Dtos/ProjectRequest.cs`
- Modify: `Portfolio/Api/Models/Dtos/ProjectResponse.cs`
- Create: `Portfolio/Api/Models/Dtos/ReorderRequest.cs`

- [ ] **Step 1: Add Slug and ThemeKey to UserProfile**

Replace the entire file:

```csharp
namespace Portfolio.Api.Models;

public class UserProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public string CvUrl { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = "unity";
}
```

- [ ] **Step 2: Add ProfileId and Order to Project**

Replace the entire file:

```csharp
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
    public int ProfileId { get; set; }
    public int Order { get; set; }
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
```

- [ ] **Step 3: Add ProfileId to ProjectRequest**

Replace the entire file:

```csharp
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
    public int ProfileId { get; set; }
    public List<int> TagIds { get; set; } = new();
}
```

- [ ] **Step 4: Add ProfileId and Order to ProjectResponse**

Replace the entire file:

```csharp
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
    public int ProfileId { get; set; }
    public int Order { get; set; }
    public List<TagDto> Tags { get; set; } = new();
}
```

- [ ] **Step 5: Create ReorderRequest DTO**

```csharp
namespace Portfolio.Api.Models.Dtos;

public class ReorderRequest
{
    public string Direction { get; set; } = string.Empty;
}
```

- [ ] **Step 6: Build to verify no compile errors**

Run from `Portfolio/`:
```powershell
dotnet build
```
Expected: Build succeeded, 0 errors.

- [ ] **Step 7: Commit**

```bash
git add Portfolio/Api/Models/ Portfolio/Api/Models/Dtos/
git commit -m "feat: add Slug/ThemeKey to UserProfile, ProfileId/Order to Project"
```

---

## Task 2: AppDbContext — FK, Index, Seed

**Files:**
- Modify: `Portfolio/Api/Data/AppDbContext.cs`

- [ ] **Step 1: Update AppDbContext**

Replace the entire file:

```csharp
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ContactMethod> ContactMethods { get; set; }
    public DbSet<UserProfile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tags)
            .WithMany()
            .UsingEntity(j => j.ToTable("ProjectTags"));

        modelBuilder.Entity<Project>()
            .HasOne<UserProfile>()
            .WithMany()
            .HasForeignKey(p => p.ProfileId);

        modelBuilder.Entity<UserProfile>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        modelBuilder.Entity<UserProfile>().HasData(
            new UserProfile
            {
                Id = 1,
                Name = "Serhio",
                Role = "Software & Unity Developer",
                Bio = "I build immersive experiences...",
                PhotoUrl = "https://placehold.co/400x400/10b981/white?text=S",
                CvUrl = "#",
                Email = "hello@example.com",
                Slug = "unity",
                ThemeKey = "unity"
            },
            new UserProfile
            {
                Id = 2,
                Name = "Serhio",
                Role = ".NET Developer",
                Bio = "I build robust backend systems and APIs.",
                PhotoUrl = "https://placehold.co/400x400/6366f1/white?text=S",
                CvUrl = "#",
                Email = "hello@example.com",
                Slug = "dotnet",
                ThemeKey = "dotnet"
            }
        );
    }
}
```

- [ ] **Step 2: Build**

```powershell
dotnet build
```
Expected: Build succeeded, 0 errors.

- [ ] **Step 3: Commit**

```bash
git add Portfolio/Api/Data/AppDbContext.cs
git commit -m "feat: add FK/index config and seed both profiles in AppDbContext"
```

---

## Task 3: EF Migration

**Files:**
- Auto-generated migration in `Portfolio/Api/Data/Migrations/`

- [ ] **Step 1: Add migration**

Run from `Portfolio/`:
```powershell
dotnet ef migrations add AddMultiProfile
```
Expected: Done. Verify a new migration file appears in `Api/Data/Migrations/`.

- [ ] **Step 2: Fix migration — set default ProfileId=1 for existing projects**

Open the generated migration file. Find the `AddColumn` call for `ProfileId` on `Projects` table. Add `defaultValue: 1` so existing rows get ProfileId=1 (Unity):

```csharp
migrationBuilder.AddColumn<int>(
    name: "ProfileId",
    table: "Projects",
    type: "INTEGER",
    nullable: false,
    defaultValue: 1);   // ← add this line
```

Also find the `AddColumn` for `Order` and confirm it has `defaultValue: 0`:
```csharp
migrationBuilder.AddColumn<int>(
    name: "Order",
    table: "Projects",
    type: "INTEGER",
    nullable: false,
    defaultValue: 0);   // ← add if missing
```

- [ ] **Step 3: Apply migration**

```powershell
dotnet ef database update
```
Expected: `Done.` No errors.

- [ ] **Step 4: Verify DB**

```powershell
dotnet run
```
In another terminal:
```bash
curl http://localhost:5177/api/profile/unity
```
Expected: JSON with `slug: "unity"`.

```bash
curl http://localhost:5177/api/profile/dotnet
```
Expected: JSON with `slug: "dotnet"`.

- [ ] **Step 5: Commit**

```bash
git add Portfolio/Api/Data/Migrations/
git commit -m "feat: add AddMultiProfile EF migration"
```

---

## Task 4: ProfileController — Slug Endpoints

**Files:**
- Modify: `Portfolio/Api/Controllers/ProfileController.cs`

- [ ] **Step 1: Update ProfileController**

Replace the entire file:

```csharp
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

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _context.Profiles.FindAsync(1);
        return Ok(profile);
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
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfile updatedProfile)
    {
        updatedProfile.Id = 1;
        _context.Entry(updatedProfile).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
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
```

- [ ] **Step 2: Test GET by slug**

```powershell
dotnet run
```
```bash
curl http://localhost:5177/api/profile/dotnet
```
Expected: `{"id":2,"name":"Serhio","role":".NET Developer","slug":"dotnet","themeKey":"dotnet",...}`

- [ ] **Step 3: Commit**

```bash
git add Portfolio/Api/Controllers/ProfileController.cs
git commit -m "feat: add GET/PUT by slug to ProfileController"
```

---

## Task 5: ProjectController — Filter + Order

**Files:**
- Modify: `Portfolio/Api/Controllers/ProjectController.cs`

- [ ] **Step 1: Replace ProjectController**

```csharp
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
            .Where(p => p.ProfileId == project.ProfileId)
            .OrderBy(p => p.Order)
            .ToListAsync();

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
```

- [ ] **Step 2: Build**

```powershell
dotnet build
```
Expected: 0 errors.

- [ ] **Step 3: Test filter**

```powershell
dotnet run
```
```bash
curl "http://localhost:5177/api/Project?profileId=1"
```
Expected: JSON array of existing Unity projects, ordered by `order`.

- [ ] **Step 4: Commit**

```bash
git add Portfolio/Api/Controllers/ProjectController.cs
git commit -m "feat: add profileId filter and order endpoint to ProjectController"
```

---

## Task 6: Frontend Services

**Files:**
- Modify: `Portfolio-Client/src/app/services/profile.service.ts`
- Modify: `Portfolio-Client/src/app/services/project.service.ts`
- Create: `Portfolio-Client/src/app/services/profile.service.spec.ts`
- Create: `Portfolio-Client/src/app/services/project.service.spec.ts`

- [ ] **Step 1: Write failing tests for ProfileService new methods**

Create `Portfolio-Client/src/app/services/profile.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';
import { API_CONFIG } from '../config/api.config';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.profile}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getBySlug calls GET on correct URL', () => {
    service.getBySlug('dotnet').subscribe();
    const r = httpMock.expectOne(`${baseUrl}/dotnet`);
    expect(r.request.method).toBe('GET');
    r.flush({});
  });

  it('updateBySlug calls PUT on correct URL', () => {
    const data = { name: 'Test', role: '.NET Dev', bio: '', photoUrl: '', cvUrl: '', email: '' };
    service.updateBySlug('dotnet', data as any).subscribe();
    const r = httpMock.expectOne(`${baseUrl}/dotnet`);
    expect(r.request.method).toBe('PUT');
    r.flush(null);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

Run from `Portfolio-Client/`:
```powershell
npx vitest run src/app/services/profile.service.spec.ts
```
Expected: FAIL — `getBySlug is not a function` (or similar).

- [ ] **Step 3: Write failing tests for ProjectService new methods**

Create `Portfolio-Client/src/app/services/project.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProjectService } from './project.service';
import { API_CONFIG } from '../config/api.config';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getByProfileId calls GET with profileId query param', () => {
    service.getByProfileId(2).subscribe();
    const r = httpMock.expectOne(`${baseUrl}?profileId=2`);
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });

  it('reorderProject calls PUT on order URL with direction', () => {
    service.reorderProject(5, 'up').subscribe();
    const r = httpMock.expectOne(`${baseUrl}/5/order`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual({ direction: 'up' });
    r.flush([]);
  });
});
```

- [ ] **Step 4: Run tests — expect failure**

```powershell
npx vitest run src/app/services/project.service.spec.ts
```
Expected: FAIL — `getByProfileId is not a function`.

- [ ] **Step 5: Update ProfileService**

Replace `Portfolio-Client/src/app/services/profile.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface UserProfile {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  email: string;
  slug: string;
  themeKey: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.profile}`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  getBySlug(slug: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${slug}`);
  }

  updateProfile(profileData: Partial<UserProfile>): Observable<void> {
    return this.http.put<void>(this.apiUrl, profileData);
  }

  updateBySlug(slug: string, profileData: Partial<UserProfile>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${slug}`, profileData);
  }
}
```

- [ ] **Step 6: Update ProjectService**

Replace `Portfolio-Client/src/app/services/project.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  profileId: number;
  order: number;
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
  profileId: number;
  tagIds: number[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getByProfileId(profileId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}?profileId=${profileId}`);
  }

  addProject(project: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: ProjectRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorderProject(id: number, direction: 'up' | 'down'): Observable<Project[]> {
    return this.http.put<Project[]>(`${this.apiUrl}/${id}/order`, { direction });
  }
}
```

- [ ] **Step 7: Run tests — expect pass**

```powershell
npx vitest run src/app/services/profile.service.spec.ts src/app/services/project.service.spec.ts
```
Expected: All 4 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add Portfolio-Client/src/app/services/
git commit -m "feat: add typed interfaces and slug/profileId methods to services"
```

---

## Task 7: ProfilePageComponent

**Files:**
- Create: `Portfolio-Client/src/app/components/profile-page/profile-page.component.ts`
- Create: `Portfolio-Client/src/app/components/profile-page/profile-page.component.html`
- Create: `Portfolio-Client/src/app/components/profile-page/profile-page.component.scss`

This component replaces `HomeComponent`. It inherits all Unity game logic (coin bubbles, HUD) and adds:
- Slug read from route params
- Profile loaded by slug
- `@HostBinding('class')` for theme switching
- Dotnet floating-symbols element (hidden in Unity theme via CSS)

- [ ] **Step 1: Create profile-page.component.ts**

```typescript
import {
  Component, HostBinding, HostListener,
  inject, OnInit, OnDestroy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { ContactMethodService, ContactMethod } from '../../services/contact-method.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MarkdownModule } from 'ngx-markdown';
import { Tag } from '../../services/tag.service';

interface FloatingCoin {
  id: number;
  left: number;
  value: number;
  duration: number;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MarkdownModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private contactMethodService = inject(ContactMethodService);

  private coinIdCounter = 0;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private despawnTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

  profile = signal<UserProfile | null>(null);
  projects = signal<Project[]>([]);
  contactMethods = signal<ContactMethod[]>([]);
  selectedProject = signal<Project | null>(null);
  gameScore = signal<number>(0);
  floatingCoins = signal<FloatingCoin[]>([]);

  @HostBinding('class')
  get themeClass(): string {
    return `theme-${this.profile()?.themeKey ?? 'unity'}`;
  }

  isUnity = computed(() => this.profile()?.themeKey === 'unity');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.profileService.getBySlug(slug).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.projectService.getByProfileId(data.id).subscribe(p => this.projects.set(p));
      },
      error: () => this.router.navigate([''])
    });

    this.contactMethodService.getMethods().subscribe(data => this.contactMethods.set(data));

    setTimeout(() => this.spawnCoin(), 5000);
    this.spawnInterval = setInterval(() => {
      if (this.floatingCoins().length < 2) this.spawnCoin();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    this.despawnTimeouts.forEach(t => clearTimeout(t));
  }

  private spawnCoin(): void {
    const id = ++this.coinIdCounter;
    const duration = 9 + Math.random() * 6;
    const coin: FloatingCoin = {
      id,
      left: 6 + Math.random() * 88,
      value: Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 3 : 5,
      duration,
    };
    this.floatingCoins.update(coins => [...coins, coin]);
    const timeout = setTimeout(() => this.despawnCoin(id), (duration + 0.5) * 1000);
    this.despawnTimeouts.set(id, timeout);
  }

  catchCoin(coin: FloatingCoin): void {
    this.gameScore.update(s => s + coin.value);
    this.despawnCoin(coin.id);
    setTimeout(() => this.spawnCoin(), 300);
  }

  private despawnCoin(id: number): void {
    this.floatingCoins.update(coins => coins.filter(c => c.id !== id));
    const t = this.despawnTimeouts.get(id);
    if (t) { clearTimeout(t); this.despawnTimeouts.delete(id); }
  }

  formattedScore(): string {
    return this.gameScore().toString().padStart(8, '0');
  }

  openProject(project: Project): void {
    this.selectedProject.set(project);
    document.documentElement.style.overflow = 'hidden';
  }

  closeProject(): void {
    this.selectedProject.set(null);
    document.documentElement.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedProject()) this.closeProject();
  }
}
```

- [ ] **Step 2: Create profile-page.component.html**

Copy the full content of `home.component.html` into `profile-page.component.html`, then make these changes:

  a. After the opening `<div class="portfolio-wrapper">` line, add the dotnet floating-symbols element:

```html
<div class="dotnet-particles" aria-hidden="true">
  @for (sym of ['{','}','</>','[]','()','<T>','=>','??','{}','[]']; track sym + $index) {
    <span class="dp-symbol">{{ sym }}</span>
  }
</div>
<div class="dotnet-accent" aria-hidden="true"></div>
```

  b. The rest of the template is identical to `home.component.html` — no other changes.

- [ ] **Step 3: Create profile-page.component.scss**

Copy the **entire content** of `home.component.scss` into `profile-page.component.scss`, then append this block at the end:

```scss
// ── Dotnet theme overrides ──────────────────────────────────────────────────

:host.theme-dotnet {
  display: block;
  background: #080808;
}

:host.theme-dotnet .portfolio-wrapper {
  --c-bg: #080808;
  --c-surface: #0f0f0f;
  --c-card: #111;
  --c-border: #1e1e1e;
  --c-border-strong: #2a2a2a;
  --c-text: #ffffff;
  --c-muted: #666;

  --c-primary: #6366f1;
  --c-primary-dark: #4f52d4;
  --c-primary-lgt: #1a1a2e;
  --c-primary-pale: #0d0d1a;

  --c-amber: #6366f1;
  --c-amber-dark: #4f52d4;
  --c-amber-lgt: #1a1a2e;

  --c-cherry: #6366f1;
  --c-cherry-lgt: #1a1a2e;

  --font-hero: system-ui, sans-serif;
  --font-display: system-ui, sans-serif;
  --font-body: system-ui, sans-serif;

  background: #080808;
}

// Hide Unity-specific game elements on dotnet profile
:host.theme-dotnet .bubble-coin,
:host.theme-dotnet .hud,
:host.theme-dotnet .bg-orbs {
  display: none;
}

// Show dotnet-specific animated background
.dotnet-particles {
  display: none;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

:host.theme-dotnet .dotnet-particles {
  display: block;
}

.dp-symbol {
  position: absolute;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.07);
  animation: dpFloat linear infinite;
  user-select: none;
  bottom: -2rem;
}

@keyframes dpFloat {
  from { transform: translateY(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.7; }
  to   { transform: translateY(-110vh) rotate(20deg); opacity: 0; }
}

// Stagger 10 symbols across viewport
.dp-symbol:nth-child(1)  { left: 5%;  font-size: 2rem;   animation-duration: 8s;  animation-delay: 0s;    }
.dp-symbol:nth-child(2)  { left: 12%; font-size: 1.2rem; animation-duration: 11s; animation-delay: -2s;   }
.dp-symbol:nth-child(3)  { left: 22%; font-size: 1.6rem; animation-duration: 7s;  animation-delay: -4s;   }
.dp-symbol:nth-child(4)  { left: 33%; font-size: 2.2rem; animation-duration: 9s;  animation-delay: -1s;   }
.dp-symbol:nth-child(5)  { left: 45%; font-size: 1rem;   animation-duration: 10s; animation-delay: -5s;   }
.dp-symbol:nth-child(6)  { left: 55%; font-size: 1.8rem; animation-duration: 6.5s;animation-delay: -3s;   }
.dp-symbol:nth-child(7)  { left: 65%; font-size: 1.4rem; animation-duration: 8.5s;animation-delay: -6s;   }
.dp-symbol:nth-child(8)  { left: 74%; font-size: 2rem;   animation-duration: 7.5s;animation-delay: -1.5s; }
.dp-symbol:nth-child(9)  { left: 83%; font-size: 1.2rem; animation-duration: 9.5s;animation-delay: -3.5s; }
.dp-symbol:nth-child(10) { left: 92%; font-size: 1.6rem; animation-duration: 6s;  animation-delay: -7s;   }

// Dotnet radial accent glow
.dotnet-accent {
  display: none;
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse 60% 50% at 70% 50%, rgba(99, 102, 241, 0.08), transparent 70%);
}

:host.theme-dotnet .dotnet-accent {
  display: block;
}

// Override hero eyebrow label
:host.theme-dotnet .eyebrow {
  color: #6366f1;
}

// Override card hover accent
:host.theme-dotnet .card-accent-bar {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}

// Dark card surface
:host.theme-dotnet .card {
  background: #111;
  border-color: #1e1e1e;
}

:host.theme-dotnet .card:hover {
  border-color: #6366f1;
}

// Override modal
:host.theme-dotnet .modal {
  background: #111;
  border: 1px solid #1e1e1e;
}

// Override primary button accent
:host.theme-dotnet .btn-primary {
  background: #6366f1;
}

:host.theme-dotnet .btn-primary:hover {
  background: #4f52d4;
}

// Global grid scroll animation hidden (would show yellow on dark bg)
:host.theme-dotnet {
  &::before { display: none; }
}
```

- [ ] **Step 4: Commit**

```bash
git add Portfolio-Client/src/app/components/profile-page/
git commit -m "feat: create ProfilePageComponent with slug routing and theme switching"
```

---

## Task 8: ChooserComponent

**Files:**
- Create: `Portfolio-Client/src/app/components/chooser/chooser.component.ts`
- Create: `Portfolio-Client/src/app/components/chooser/chooser.component.html`
- Create: `Portfolio-Client/src/app/components/chooser/chooser.component.scss`

- [ ] **Step 1: Create chooser.component.ts**

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile.service';

@Component({
  selector: 'app-chooser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chooser.component.html',
  styleUrl: './chooser.component.scss'
})
export class ChooserComponent implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);

  unityProfile = signal<UserProfile | null>(null);
  dotnetProfile = signal<UserProfile | null>(null);
  hoveredSlug = signal<string | null>(null);

  ngOnInit(): void {
    this.profileService.getBySlug('unity').subscribe(p => this.unityProfile.set(p));
    this.profileService.getBySlug('dotnet').subscribe(p => this.dotnetProfile.set(p));
  }

  navigate(slug: string): void {
    this.router.navigate([slug]);
  }
}
```

- [ ] **Step 2: Create chooser.component.html**

```html
<div class="chooser">
  <!-- Unity Half -->
  <div
    class="half half-unity"
    [class.expanded]="hoveredSlug() === 'unity'"
    [class.shrunk]="hoveredSlug() === 'dotnet'"
    (mouseenter)="hoveredSlug.set('unity')"
    (mouseleave)="hoveredSlug.set(null)"
    (click)="navigate('unity')"
    (keydown.enter)="navigate('unity')"
    (keydown.space)="navigate('unity')"
    tabindex="0"
    role="button"
    aria-label="View Unity Developer profile"
  >
    <div class="half-bg unity-bg" aria-hidden="true"></div>
    <div class="half-content">
      <div class="half-eyebrow">GAME DEVELOPER</div>
      <h2 class="half-name">{{ unityProfile()?.name || 'Serhii Chekun' }}</h2>
      <p class="half-role">{{ unityProfile()?.role || 'Unity & Mobile' }}</p>
      <div class="half-cta">View Profile →</div>
    </div>
  </div>

  <!-- Divider -->
  <div class="divider" aria-hidden="true"></div>

  <!-- .NET Half -->
  <div
    class="half half-dotnet"
    [class.expanded]="hoveredSlug() === 'dotnet'"
    [class.shrunk]="hoveredSlug() === 'unity'"
    (mouseenter)="hoveredSlug.set('dotnet')"
    (mouseleave)="hoveredSlug.set(null)"
    (click)="navigate('dotnet')"
    (keydown.enter)="navigate('dotnet')"
    (keydown.space)="navigate('dotnet')"
    tabindex="0"
    role="button"
    aria-label="View .NET Developer profile"
  >
    <div class="half-bg dotnet-bg" aria-hidden="true">
      <span class="dp-sym s1">{}</span>
      <span class="dp-sym s2">&lt;/&gt;</span>
      <span class="dp-sym s3">[]</span>
      <span class="dp-sym s4">=&gt;</span>
      <span class="dp-sym s5">&lt;T&gt;</span>
    </div>
    <div class="half-content">
      <div class="half-eyebrow dotnet-eyebrow">.NET DEVELOPER</div>
      <h2 class="half-name dotnet-name">{{ dotnetProfile()?.name || 'Serhii Chekun' }}</h2>
      <p class="half-role dotnet-role">{{ dotnetProfile()?.role || 'ASP.NET Core & C#' }}</p>
      <div class="half-cta dotnet-cta">View Profile →</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create chooser.component.scss**

```scss
.chooser {
  display: flex;
  height: 100vh;
  overflow: hidden;
  cursor: pointer;
}

.half {
  position: relative;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.expanded { width: 65%; }
  &.shrunk   { width: 35%; }

  &:focus-visible {
    outline: 3px solid white;
    outline-offset: -3px;
  }
}

// Unity half — warm amber / game aesthetic
.half-unity {
  background: oklch(97.5% 0.008 75);
}

.unity-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 40% 45%, oklch(94% 0.07 75 / 0.6), transparent 70%),
    linear-gradient(oklch(70% 0.22 75 / 0.12) 1px, transparent 1px),
    linear-gradient(90deg, oklch(70% 0.22 75 / 0.12) 1px, transparent 1px);
  background-size: auto, 40px 40px, 40px 40px;
}

// .NET half — monochrome dark
.half-dotnet {
  background: #080808;
}

.dotnet-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 60% 50%, rgba(99, 102, 241, 0.1), transparent 70%);
  overflow: hidden;
}

.dp-sym {
  position: absolute;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.06);
  animation: dpChooserFloat linear infinite;
  user-select: none;
}

@keyframes dpChooserFloat {
  from { transform: translateY(110vh); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.6; }
  to   { transform: translateY(-10vh); opacity: 0; }
}

.s1 { left: 10%; font-size: 3rem;   animation-duration: 7s;  animation-delay: 0s;   }
.s2 { left: 30%; font-size: 2rem;   animation-duration: 9s;  animation-delay: -2s;  }
.s3 { left: 55%; font-size: 2.5rem; animation-duration: 6s;  animation-delay: -4s;  }
.s4 { left: 70%; font-size: 1.5rem; animation-duration: 10s; animation-delay: -1s;  }
.s5 { left: 85%; font-size: 2rem;   animation-duration: 8s;  animation-delay: -5s;  }

// Content
.half-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .half:hover & { transform: scale(1.03); }
}

.half-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: oklch(48% 0.24 278);
  margin-bottom: 0.75rem;
  font-family: 'Nunito', sans-serif;
}

.dotnet-eyebrow {
  color: #6366f1;
  font-family: 'Courier New', monospace;
}

.half-name {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: oklch(22% 0.018 265);
  margin: 0 0 0.5rem;
  font-family: 'Fredoka', sans-serif;
}

.dotnet-name {
  color: #ffffff;
  font-family: system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.half-role {
  font-size: 1rem;
  color: oklch(52% 0.025 265);
  margin: 0 0 1.5rem;
}

.dotnet-role {
  color: #555;
  font-family: 'Courier New', monospace;
}

.half-cta {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  border: 1.5px solid oklch(48% 0.24 278);
  color: oklch(48% 0.24 278);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s, transform 0.3s;

  .half:hover & {
    opacity: 1;
    transform: translateY(0);
  }
}

.dotnet-cta {
  border-color: #6366f1;
  color: #6366f1;
}

// Vertical divider
.divider {
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.3) 30%, oklch(78% 0.032 75) 50%, rgba(99, 102, 241, 0.3) 70%, transparent);
  z-index: 2;
  flex-shrink: 0;
  transition: opacity 0.4s;
}

// Mobile: stack vertically
@media (max-width: 768px) {
  .chooser {
    flex-direction: column;
  }

  .half,
  .half.expanded,
  .half.shrunk {
    width: 100%;
    height: 50vh;
  }

  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(99, 102, 241, 0.3), transparent);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add Portfolio-Client/src/app/components/chooser/
git commit -m "feat: create ChooserComponent with split-screen hover expand"
```

---

## Task 9: Routes Update

**Files:**
- Modify: `Portfolio-Client/src/app/app.routes.ts`

- [ ] **Step 1: Update routes**

Replace the entire file:

```typescript
import { Routes } from '@angular/router';
import { ChooserComponent } from './components/chooser/chooser.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: ChooserComponent },
  { path: ':slug', component: ProfilePageComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
];
```

**Important:** The `:slug` route catches `unity`, `dotnet`, and any future slugs. It also catches `admin` and `login` — but those are listed **before** `**` redirect and Angular matches routes top-down, so `admin` and `login` match their specific paths first. However `:slug` will try to match before `admin` in this order. **Reorder so named paths come before `:slug`:**

```typescript
export const routes: Routes = [
  { path: '', component: ChooserComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: ':slug', component: ProfilePageComponent },
  { path: '**', redirectTo: '' }
];
```

- [ ] **Step 2: Delete HomeComponent files**

```bash
rm Portfolio-Client/src/app/components/home/home.component.ts
rm Portfolio-Client/src/app/components/home/home.component.html
rm Portfolio-Client/src/app/components/home/home.component.scss
```

- [ ] **Step 3: Start dev server and verify**

```powershell
ng serve
```

- Navigate to `http://localhost:4200` — expect split-screen chooser.
- Click Unity half — expect `http://localhost:4200/unity` with the Unity profile page.
- Click browser back — expect chooser again.
- Navigate to `http://localhost:4200/dotnet` — expect the profile page with dark background and floating symbols.
- Navigate to `http://localhost:4200/admin` — expect admin panel (redirect to login if not authenticated).

- [ ] **Step 4: Commit**

```bash
git add Portfolio-Client/src/app/app.routes.ts
git rm Portfolio-Client/src/app/components/home/home.component.ts
git rm Portfolio-Client/src/app/components/home/home.component.html
git rm Portfolio-Client/src/app/components/home/home.component.scss
git commit -m "feat: replace home route with ChooserComponent and add :slug route for ProfilePageComponent"
```

---

## Task 10: Admin — Profile Switcher + Project Ordering

**Files:**
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.ts`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.html`

The admin gains a profile switcher row (Unity | .NET) above the existing content tabs. All project/profile operations are scoped to the active profile.

- [ ] **Step 1: Update admin.component.ts**

Add these fields after the existing signal declarations (after `editingContactId`):

```typescript
profiles = signal<UserProfile[]>([]);
activeProfileSlug = signal<string>('unity');
```

Add this import at the top of the file:
```typescript
import { UserProfile } from '../../services/profile.service';
```

Add a computed property after `isSubmittingContact`:
```typescript
get activeProfile(): UserProfile | undefined {
  return this.profiles().find(p => p.slug === this.activeProfileSlug());
}
```

Update `ngOnInit` to load both profiles:
```typescript
ngOnInit(): void {
  this.loadProfiles();
  this.loadProjects();
  this.loadTags();
  this.loadContactMethods();
}
```

Add `loadProfiles()` method:
```typescript
loadProfiles() {
  this.profileService.getBySlug('unity').subscribe({
    next: (p) => this.profiles.update(ps => {
      const filtered = ps.filter(x => x.slug !== 'unity');
      return [...filtered, p];
    }),
    error: (err) => console.error('Failed to load unity profile', err)
  });
  this.profileService.getBySlug('dotnet').subscribe({
    next: (p) => this.profiles.update(ps => {
      const filtered = ps.filter(x => x.slug !== 'dotnet');
      return [...filtered, p];
    }),
    error: (err) => console.error('Failed to load dotnet profile', err)
  });
}
```

Update `loadProjects()` to filter by active profile:
```typescript
loadProjects() {
  const profileId = this.activeProfile?.id;
  if (!profileId) {
    // Profiles not loaded yet — will be called again after switchProfile
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
    return;
  }
  this.projectService.getByProfileId(profileId).subscribe({
    next: (data) => this.projects.set(data),
    error: (err) => console.error('Failed to load projects', err)
  });
}
```

Add `switchProfile()` method:
```typescript
switchProfile(slug: string) {
  this.activeProfileSlug.set(slug);
  this.cancelEdit();
  const profile = this.activeProfile;
  if (profile) {
    this.projectService.getByProfileId(profile.id).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
    this.profileForm.patchValue({
      name: profile.name,
      role: profile.role,
      bio: profile.bio,
      photoUrl: profile.photoUrl,
      cvUrl: profile.cvUrl,
      email: profile.email
    });
  }
}
```

Update `loadProfile()` to use active profile slug:
```typescript
loadProfile() {
  const slug = this.activeProfileSlug();
  this.profileService.getBySlug(slug).subscribe({
    next: (data) => { if (data) this.profileForm.patchValue(data); },
    error: (err) => console.error('Failed to load profile', err)
  });
}
```

Update `onProfileSubmit()` to use slug:
```typescript
onProfileSubmit() {
  if (this.profileForm.invalid || this.isSubmittingProfile) return;
  this.isSubmittingProfile = true;
  const slug = this.activeProfileSlug();
  this.profileService.updateBySlug(slug, this.profileForm.value as any).subscribe({
    next: () => { alert('Profile updated successfully!'); this.isSubmittingProfile = false; },
    error: () => { this.isSubmittingProfile = false; }
  });
}
```

Update `onSubmit()` to include profileId:
```typescript
onSubmit() {
  if (this.projectForm.invalid || this.isSubmittingProject) return;
  this.isSubmittingProject = true;
  const id = this.editingProjectId();
  const projectData: ProjectRequest = {
    ...(this.projectForm.value as Omit<ProjectRequest, 'tagIds' | 'profileId'>),
    tagIds: this.selectedTagIds(),
    profileId: this.activeProfile?.id ?? 1
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
```

Add `moveProject()` method:
```typescript
moveProject(index: number, direction: 'up' | 'down') {
  const project = this.projects()[index];
  if (!project) return;
  this.projectService.reorderProject(project.id, direction).subscribe({
    next: (updated) => this.projects.set(updated),
    error: (err) => console.error('Reorder failed', err)
  });
}
```

Also add `ProjectRequest` to the import from project service:
```typescript
import { ProjectService, Project, ProjectRequest } from '../../services/project.service';
```

- [ ] **Step 2: Update admin.component.html — add profile switcher**

At the very top of the file, before the existing `<nav class="admin-tabs">`, add:

```html
<div class="profile-switcher">
  <button
    [class.active]="activeProfileSlug() === 'unity'"
    (click)="switchProfile('unity')">
    🎮 Unity
  </button>
  <button
    [class.active]="activeProfileSlug() === 'dotnet'"
    (click)="switchProfile('dotnet')">
    ⚙️ .NET
  </button>
</div>
```

- [ ] **Step 3: Update admin.component.html — add ↑↓ buttons on project rows**

Find the project list section in the admin HTML. It renders each project. Locate the project list items (search for `deleteProject`) and add order buttons beside each project's edit/delete buttons:

```html
<button class="btn-icon" (click)="moveProject($index, 'up')" [disabled]="$index === 0" aria-label="Move up">↑</button>
<button class="btn-icon" (click)="moveProject($index, 'down')" [disabled]="$index === projects().length - 1" aria-label="Move down">↓</button>
```

Place these before the existing Edit button on each project row.

- [ ] **Step 4: Add profile switcher styles to admin.component.scss**

Open `admin.component.scss` and append:

```scss
.profile-switcher {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem 0;

  button {
    padding: 0.4rem 1.2rem;
    border-radius: 999px;
    border: 1.5px solid var(--border, #e2e8f0);
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s, color 0.15s;

    &.active {
      background: var(--primary, #6366f1);
      border-color: var(--primary, #6366f1);
      color: white;
    }
  }
}
```

- [ ] **Step 5: Verify admin in browser**

With backend running:
1. Log in to `/admin`
2. Confirm profile switcher shows "🎮 Unity" and "⚙️ .NET" tabs
3. Switch to .NET — projects list should be empty (no .NET projects yet)
4. Switch back to Unity — projects should return
5. On Unity tab, confirm ↑↓ buttons appear on project rows
6. Click ↑ on second project — it should move up in the list
7. Click Profile Info tab — role should show "Software & Unity Developer"
8. Switch to .NET, click Profile Info — role should show ".NET Developer"

- [ ] **Step 6: Commit**

```bash
git add Portfolio-Client/src/app/components/admin/
git commit -m "feat: add profile switcher tabs and project order buttons to admin panel"
```

---

## Self-Review Checklist

Run this before marking the plan complete:

- [ ] **Spec coverage:** Slug column ✓ · ThemeKey ✓ · ProfileId on Project ✓ · Order on Project ✓ · GET/PUT by slug ✓ · GET projects filtered ✓ · Order endpoint ✓ · ProfilePageComponent ✓ · ChooserComponent ✓ · Routes ✓ · Dotnet theme ✓ · Admin profile tabs ✓ · Admin order buttons ✓ · Contact methods global (not changed) ✓ · Tags global (not changed) ✓

- [ ] **No profile creation UI** — only edit of existing two profiles (confirmed: no create endpoint, no create form)

- [ ] **Route order correct** — `admin` and `login` before `:slug` in routes array

- [ ] **Order boundary** — ↑ disabled on first item, ↓ disabled on last item; backend returns 400 at boundary

- [ ] **Existing Unity profile unchanged** — `Id=1` still works, `GET /api/profile` still returns Id=1, Unity page looks identical

---

## Execution

```
Plan complete. Two execution options:

1. Subagent-Driven (recommended) — dispatch a fresh subagent per task, review between tasks
2. Inline Execution — execute tasks in this session using executing-plans

Which approach?
```
