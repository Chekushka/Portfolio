# Editable Hero Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero stat slot 1 (project count) is derived; slots 2 and 3 become free-form label/value pairs stored on `UserProfile` and editable in the admin panel, replacing the `isUnity()`-gated literal stat strings added in the previous iteration.

**Architecture:** Add five nullable string columns to `UserProfile` via one additive EF migration (backfilled for both seeded rows). Extend the existing profile GET/PUT flow (entity used directly as request/response — no separate DTO layer exists for Profile) to carry the fields. On the frontend, two `computed()` signals on `ProfilePageComponent` derive the visible stat list (slot 1 from project count, slots 2/3 from profile fields, each hidden when incomplete) and a `@for` loop renders dividers only between visible slots. `AdminComponent` gets five new form controls grouped under a "Hero Stats" heading.

**Tech Stack:** ASP.NET Core 8 / EF Core (SQLite), Angular 21 standalone components + signals, Vitest.

## Global Constraints

- Profiles stay a fixed set of two (`unity`=1, `dotnet`=2). No create/delete-profile logic.
- `ThemeKey` and `Slug` stay seed-only and read-only in the admin form.
- Stat values are **strings**, never parsed/summed/incremented (same rationale as `Project.Downloads`).
- Schema changes via EF migrations only, applied through the existing `Database.Migrate()` call in `Program.cs`. Never `EnsureCreated()`.
- SQLite only — do not touch `Migrations/20260314144117_InitialPostgres.cs`.
- Never modify an existing migration file — this feature is a new migration appended to the chain.
- Run only the specific spec file after frontend changes (`npx ng test --include='<path>'`), not the full suite. **Do not use `npx vitest run` directly** — it skips Angular's build step that inlines `templateUrl`/`styleUrl`, and any component using external template/style files (e.g. `ProfilePageComponent`, `AppComponent`) will fail with a spurious "Component is not resolved" error that has nothing to do with your change.

## Spec Mismatch Found

The task brief says "Extend the `ProfileResponse`/`ProfileRequest` DTOs in `Api/Models/Dtos/`." **No such DTOs exist.** `ProfileController` (`Portfolio/Api/Controllers/ProfileController.cs`) uses the `UserProfile` entity directly as both the GET response body and the PUT request body — `UpdateProfileBySlug` takes `[FromBody] UserProfile updatedProfile` and manually copies a whitelist of six properties onto the tracked entity (this manual copy _is_ the existing whitelist mechanism; it's how `Slug`/`ThemeKey` already get ignored). This plan extends that existing pattern (add properties to the entity, extend the manual copy list) rather than introducing a new DTO layer that doesn't exist anywhere else in this controller. Also note: migrations physically live in `Portfolio/Migrations/`, not `Portfolio/Api/Data/Migrations/` as `AI_CONTEXT.md`'s folder map states — used the real path throughout.

---

## Task 1: Backend schema — `AddProfileStats` migration

**Files:**

- Modify: `Portfolio/Api/Models/UserProfile.cs`
- Modify: `Portfolio/Api/Data/AppDbContext.cs:34-59` (the `HasData` seed block)
- Create (generated): `Portfolio/Migrations/<timestamp>_AddProfileStats.cs` and its `.Designer.cs`
- Modify (generated): `Portfolio/Migrations/AppDbContextModelSnapshot.cs`

**Interfaces:**

- Produces: `UserProfile.ProjectsStatLabel`, `.Stat2Label`, `.Stat2Value`, `.Stat3Label`, `.Stat3Value` — all `string?`. Task 2 (controller whitelist) and Task 4/5 (frontend) depend on these exact names.

- [ ] **Step 1: Add the five nullable properties to the entity**

Edit `Portfolio/Api/Models/UserProfile.cs`:

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
    public string? ProjectsStatLabel { get; set; }
    public string? Stat2Label { get; set; }
    public string? Stat2Value { get; set; }
    public string? Stat3Label { get; set; }
    public string? Stat3Value { get; set; }
}
```

- [ ] **Step 2: Update the `HasData` seed to carry the backfill values**

Edit `Portfolio/Api/Data/AppDbContext.cs` — this is what EF diffs against to auto-generate the migration's `UpdateData` calls (the same mechanism that produced `AddMultiProfile`'s seed insert/update):

```csharp
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
                ThemeKey = "unity",
                ProjectsStatLabel = "GAMES",
                Stat2Label = "DOWNLOADS",
                Stat2Value = "100K+",
                Stat3Label = "YRS XP",
                Stat3Value = "4+"
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
                ThemeKey = "dotnet",
                ProjectsStatLabel = "PROJECTS",
                Stat2Label = "YRS XP",
                Stat2Value = "4+"
            }
        );
```

Note: `Stat3Label`/`Stat3Value` are simply omitted for `Id=2` (dotnet) — they stay `null`, matching the spec.

- [ ] **Step 3: Generate the migration**

Run from `Portfolio/`:

```powershell
dotnet ef migrations add AddProfileStats
```

Expected: creates `Migrations/<timestamp>_AddProfileStats.cs` + `.Designer.cs`, updates `AppDbContextModelSnapshot.cs`.

- [ ] **Step 4: Inspect the generated migration**

Open the new `<timestamp>_AddProfileStats.cs` and confirm `Up()` contains:

- Five `AddColumn<string>(..., nullable: true)` calls against table `Profiles` for `ProjectsStatLabel`, `Stat2Label`, `Stat2Value`, `Stat3Label`, `Stat3Value`.
- An `UpdateData` call for `Id = 1` setting all five columns to the unity values above.
- An `UpdateData` call for `Id = 2` setting `ProjectsStatLabel`/`Stat2Label`/`Stat2Value` to the dotnet values (Stat3 columns untouched/left null).

And `Down()` contains the five matching `DropColumn` calls (plus EF's auto-generated reverse `UpdateData`, which is harmless since the columns are dropped anyway). If EF didn't produce the `UpdateData` calls (e.g. because the SQLite provider treated the new-column defaults differently), add them manually to `Up()` using `migrationBuilder.UpdateData(...)` following the exact pattern in `Migrations/20260708093256_AddMultiProfile.cs:41-51`.

- [ ] **Step 5: Apply to the existing dev database**

```powershell
dotnet ef database update
```

Expected: succeeds with no errors against the existing `portfolio.db` (which has data).

- [ ] **Step 6: Verify the backfill on the existing DB**

```powershell
sqlite3 ../Portfolio.db "SELECT Id, ProjectsStatLabel, Stat2Label, Stat2Value, Stat3Label, Stat3Value FROM Profiles;"
```

(Adjust the path — the file is `Portfolio/portfolio.db` per `git status`.) Expected: Id=1 row shows GAMES/DOWNLOADS/100K+/YRS XP/4+; Id=2 row shows PROJECTS/YRS XP/4+/NULL/NULL.

- [ ] **Step 7: Verify a fresh database applies cleanly**

```powershell
Remove-Item -Confirm:$false ./portfolio_fresh_test.db -ErrorAction SilentlyContinue
$env:ConnectionStrings__DefaultConnection = "Data Source=portfolio_fresh_test.db"
dotnet ef database update
sqlite3 ./portfolio_fresh_test.db "SELECT Id, ProjectsStatLabel, Stat3Label FROM Profiles;"
Remove-Item ./portfolio_fresh_test.db
Remove-Item Env:\ConnectionStrings__DefaultConnection
```

Expected: migration chain applies end-to-end on an empty file, same backfilled values as Step 6.

- [ ] **Step 8: Commit**

```bash
git add Portfolio/Api/Models/UserProfile.cs Portfolio/Api/Data/AppDbContext.cs Portfolio/Migrations/
git commit -m "feat: add editable hero-stat fields to UserProfile"
```

---

## Task 2: Backend API — extend the profile update whitelist

**Files:**

- Modify: `Portfolio/Api/Controllers/ProfileController.cs`

**Interfaces:**

- Consumes: `UserProfile.ProjectsStatLabel/Stat2Label/Stat2Value/Stat3Label/Stat3Value` (Task 1).
- Produces: `PUT /api/profile/{slug}` persists the five fields; `GET /api/profile/{slug}` already returns them for free (entity serialized directly).

- [ ] **Step 1: Extend the manual copy whitelist**

Edit `Portfolio/Api/Controllers/ProfileController.cs`:

```csharp
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
        existing.ProjectsStatLabel = updatedProfile.ProjectsStatLabel;
        existing.Stat2Label = updatedProfile.Stat2Label;
        existing.Stat2Value = updatedProfile.Stat2Value;
        existing.Stat3Label = updatedProfile.Stat3Label;
        existing.Stat3Value = updatedProfile.Stat3Value;

        await _context.SaveChangesAsync();
        return NoContent();
    }
```

`Slug` and `ThemeKey` remain untouched — same as before.

- [ ] **Step 2: Build**

```powershell
dotnet build
```

Expected: 0 errors.

- [ ] **Step 3: Manual smoke test of the endpoint**

Start the API (`dotnet run`), log in via `/api/auth/login` with the dev `AdminCredentials`, then:

```powershell
curl -X PUT http://localhost:5177/api/profile/unity -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"Serhio","role":"Software & Unity Developer","bio":"x","photoUrl":"","cvUrl":"#","email":"hello@example.com","projectsStatLabel":"GAMES","stat2Label":"DOWNLOADS","stat2Value":"250K+","stat3Label":"YRS XP","stat3Value":"5+"}'
curl http://localhost:5177/api/profile/unity
```

Expected: PUT returns 204; GET reflects `stat2Value: "250K+"`, `stat3Value: "5+"`.

- [ ] **Step 4: Commit**

```bash
git add Portfolio/Api/Controllers/ProfileController.cs
git commit -m "feat: persist hero-stat fields through the profile update endpoint"
```

---

## Task 3: Frontend service — typed `UserProfile` model

**Files:**

- Modify: `Portfolio-Client/src/app/services/profile.service.ts`

**Interfaces:**

- Produces: `UserProfile` interface gains `projectsStatLabel: string | null`, `stat2Label: string | null`, `stat2Value: string | null`, `stat3Label: string | null`, `stat3Value: string | null`. Tasks 4 and 5 consume this.

- [ ] **Step 1: Extend the interface**

Edit `Portfolio-Client/src/app/services/profile.service.ts`:

```typescript
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
  projectsStatLabel: string | null;
  stat2Label: string | null;
  stat2Value: string | null;
  stat3Label: string | null;
  stat3Value: string | null;
}
```

No changes needed to `getBySlug`/`updateBySlug` — both are already generically typed against `UserProfile`/`Partial<UserProfile>`.

- [ ] **Step 2: Run the existing service spec to confirm nothing broke**

```powershell
npx ng test --include='src/app/services/profile.service.spec.ts'
```

Expected: PASS (existing tests build `Partial<UserProfile>` literals that omit the new fields, which is legal since the test uses `Partial<>`).

- [ ] **Step 3: Commit**

Fold into Task 4's commit (same logical "frontend render" chunk per the brief) — no standalone commit here.

---

## Task 4: Frontend — derived + editable hero stats on `ProfilePageComponent`

**Files:**

- Modify: `Portfolio-Client/src/app/components/profile-page/profile-page.component.ts`
- Modify: `Portfolio-Client/src/app/components/profile-page/profile-page.component.html:47-79`
- Create: `Portfolio-Client/src/app/components/profile-page/profile-page.component.spec.ts`

**Interfaces:**

- Consumes: `UserProfile` (Task 3), existing `projects` signal (`signal<Project[]>`).
- Produces: `projectCount = computed<number>()`, `heroStats = computed<{ label: string; value: string }[]>()` — public component properties, used directly in the template and asserted directly in the spec.

- [ ] **Step 1: Write the failing spec**

Create `Portfolio-Client/src/app/components/profile-page/profile-page.component.spec.ts`:

```typescript
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { provideMarkdown } from "ngx-markdown";
import { ProfilePageComponent } from "./profile-page.component";
import { Project } from "../../services/project.service";
import { UserProfile } from "../../services/profile.service";

function makeProject(id: number): Project {
  return {
    id,
    name: `Project ${id}`,
    description: "",
    downloads: "0",
    videoLayout: "above",
    profileId: 1,
    order: id,
    tags: [],
  };
}

function makeProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: 1,
    name: "",
    role: "",
    bio: "",
    photoUrl: "",
    cvUrl: "",
    email: "",
    slug: "unity",
    themeKey: "unity",
    projectsStatLabel: null,
    stat2Label: null,
    stat2Value: null,
    stat3Label: null,
    stat3Value: null,
    ...overrides,
  };
}

describe("ProfilePageComponent hero stats", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideMarkdown(),
      ],
    });
  });

  it("projectCount reflects the number of loaded projects", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.projects.set([makeProject(1), makeProject(2), makeProject(3)]);
    expect(component.projectCount()).toBe(3);
  });

  it("hides slot 1 when the project count is zero even if a label is set", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.profile.set(makeProfile({ projectsStatLabel: "GAMES" }));
    component.projects.set([]);
    expect(component.heroStats()).toEqual([]);
  });

  it("hides slot 3 when only its label is set and includes complete slots 1 and 2", () => {
    const fixture = TestBed.createComponent(ProfilePageComponent);
    const component = fixture.componentInstance;
    component.profile.set(
      makeProfile({
        projectsStatLabel: "GAMES",
        stat2Label: "DOWNLOADS",
        stat2Value: "100K+",
        stat3Label: "YRS XP",
        stat3Value: null,
      }),
    );
    component.projects.set([makeProject(1)]);
    expect(component.heroStats()).toEqual([
      { label: "GAMES", value: "1+" },
      { label: "DOWNLOADS", value: "100K+" },
    ]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```powershell
npx ng test --include='src/app/components/profile-page/profile-page.component.spec.ts'
```

Expected: FAIL — `projectCount`/`heroStats` don't exist on `ProfilePageComponent` yet (TypeScript compile error surfaced as a test failure).

- [ ] **Step 3: Add the computed signals**

Edit `Portfolio-Client/src/app/components/profile-page/profile-page.component.ts`. First, extend the initial `profile` signal default (line 43):

```typescript
profile = signal<UserProfile>({
  id: 0,
  name: "",
  role: "",
  bio: "",
  photoUrl: "",
  cvUrl: "",
  email: "",
  slug: "",
  themeKey: "unity",
  projectsStatLabel: null,
  stat2Label: null,
  stat2Value: null,
  stat3Label: null,
  stat3Value: null,
});
```

Then add the two computed signals directly below the existing `isUnity` computed (line 50):

```typescript
isUnity = computed(() => this.profile().themeKey === "unity");

projectCount = computed(() => this.projects().length);

heroStats = computed<{ label: string; value: string }[]>(() => {
  const p = this.profile();
  const stats: { label: string; value: string }[] = [];
  if (p.projectsStatLabel && this.projectCount() > 0) {
    stats.push({
      label: p.projectsStatLabel,
      value: `${this.projectCount()}+`,
    });
  }
  if (p.stat2Label && p.stat2Value) {
    stats.push({ label: p.stat2Label, value: p.stat2Value });
  }
  if (p.stat3Label && p.stat3Value) {
    stats.push({ label: p.stat3Label, value: p.stat3Value });
  }
  return stats;
});
```

- [ ] **Step 4: Run the spec again to verify it passes**

```powershell
npx ng test --include='src/app/components/profile-page/profile-page.component.spec.ts'
```

Expected: PASS (3/3).

- [ ] **Step 5: Replace the hardcoded stat markup in the template**

In `Portfolio-Client/src/app/components/profile-page/profile-page.component.html`, replace lines 47-79 (the whole `<div class="hero-stats">...</div>` block, both the `isUnity()` branch and its `@else`) with:

```html
<div class="hero-stats">
  @for (stat of heroStats(); track stat.label; let last = $last) {
  <div class="stat">
    <div class="stat-num">{{ stat.value }}</div>
    <div class="stat-lbl">{{ stat.label }}</div>
  </div>
  @if (!last) {
  <div class="stat-divider"></div>
  } }
</div>
```

Leave the badges block (`@if (isUnity()) { ... } @else { ... }` around lines 127-135) untouched — floating avatar badges stay theme-hardcoded, out of scope.

- [ ] **Step 6: Manual verification in the browser**

Start the frontend dev server and backend API, navigate to `/unity` and `/dotnet`, and confirm:

- `/unity` shows three stats (GAMES/count+, DOWNLOADS/100K+, YRS XP/4+) with two dividers.
- `/dotnet` shows two stats (PROJECTS/count+, YRS XP/4+) with one divider, no trailing divider.
- Resize to 1440/1024/390px in both themes — layout holds, no broken wrapping.

- [ ] **Step 7: Commit**

```bash
git add Portfolio-Client/src/app/services/profile.service.ts Portfolio-Client/src/app/components/profile-page/
git commit -m "feat: derive hero stat slots from profile data and project count"
```

---

## Task 5: Frontend — admin form for hero stats

**Files:**

- Modify: `Portfolio-Client/src/app/components/admin/admin.component.ts`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.html:24-59`
- Modify: `Portfolio-Client/src/app/components/admin/admin.component.scss`

**Interfaces:**

- Consumes: `UserProfile` (Task 3).
- Produces: no new public interfaces — internal form state only.

- [ ] **Step 1: Add the five form controls**

Edit `Portfolio-Client/src/app/components/admin/admin.component.ts`:

```typescript
profileForm = new FormGroup({
  name: new FormControl("", Validators.required),
  role: new FormControl("", Validators.required),
  bio: new FormControl(""),
  photoUrl: new FormControl(""),
  cvUrl: new FormControl(""),
  email: new FormControl("", Validators.email),
  projectsStatLabel: new FormControl(""),
  stat2Label: new FormControl(""),
  stat2Value: new FormControl(""),
  stat3Label: new FormControl(""),
  stat3Value: new FormControl(""),
});
```

- [ ] **Step 2: Include the new fields in the submit payload**

Edit `onProfileSubmit()` in the same file:

```typescript
  onProfileSubmit() {
    if (this.profileForm.invalid || this.isSubmittingProfile) return;
    this.isSubmittingProfile = true;
    const slug = this.activeProfileSlug();
    const { name, role, bio, photoUrl, cvUrl, email, projectsStatLabel, stat2Label, stat2Value, stat3Label, stat3Value } = this.profileForm.value;
    this.profileService.updateBySlug(slug, {
      name: name ?? '',
      role: role ?? '',
      bio: bio ?? '',
      photoUrl: photoUrl ?? '',
      cvUrl: cvUrl ?? '',
      email: email ?? '',
      projectsStatLabel: projectsStatLabel ?? '',
      stat2Label: stat2Label ?? '',
      stat2Value: stat2Value ?? '',
      stat3Label: stat3Label ?? '',
      stat3Value: stat3Value ?? ''
    }).subscribe({
      next: () => { alert('Profile updated successfully!'); this.isSubmittingProfile = false; },
      error: () => { this.isSubmittingProfile = false; }
    });
  }
```

`patchValue(this.activeProfile()!)` in `loadProfiles()`/`switchProfile()` already patches these by name with no further changes needed — `UserProfile` (Task 3) and `profileForm`'s control names line up.

- [ ] **Step 3: Add the "Hero Stats" section to the template**

Edit `Portfolio-Client/src/app/components/admin/admin.component.html` — insert after the bio `<textarea>` (line 48) and before `<div class="form-actions">` (line 49):

```html
<div class="form-field hero-stats-group">
  <h3 class="subsection-heading">Hero Stats</h3>
  <p class="empty-hint">
    Slot 1's number is derived automatically from this profile's project count —
    only its label is editable here.
  </p>
  <div class="form-row">
    <input
      formControlName="projectsStatLabel"
      placeholder="Stat 1 Label (e.g. GAMES)"
    />
  </div>
  <div class="form-row">
    <input
      formControlName="stat2Label"
      placeholder="Stat 2 Label (e.g. DOWNLOADS)"
    />
    <input
      formControlName="stat2Value"
      placeholder="Stat 2 Value (e.g. 100K+)"
    />
  </div>
  <div class="form-row">
    <input
      formControlName="stat3Label"
      placeholder="Stat 3 Label (e.g. YRS XP)"
    />
    <input formControlName="stat3Value" placeholder="Stat 3 Value (e.g. 4+)" />
  </div>
</div>
```

- [ ] **Step 4: Add the heading style**

Edit `Portfolio-Client/src/app/components/admin/admin.component.scss` — add near `.field-label`/`.form-field` (around line 222):

```scss
.subsection-heading {
  font-size: 1.05rem;
  margin: 0 0 4px;
  color: var(--g-text);
}

.hero-stats-group .empty-hint {
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 5: Manual verification in the browser**

In `/admin`, Profile tab: edit all five fields for `unity`, save, reload `/unity` — confirm the three stats and their new values persist. Switch to `.NET` tab, clear `Stat 3 Label`/`Stat 3 Value`, save, reload `/dotnet` — confirm the strip renders two stats with no trailing divider. Switch back to `unity`, clear `Stat 3` there too, save, reload `/unity` — confirm two stats, no trailing divider (covers the brief's explicit manual-test callout).

- [ ] **Step 6: Commit**

```bash
git add Portfolio-Client/src/app/components/admin/
git commit -m "feat: edit hero-stat labels and values from the admin panel"
```

---

## Task 6: Docs — `TASKS.md` and `AI_CONTEXT.md`

**Files:**

- Modify: `TASKS.md`
- Modify: `AI_CONTEXT.md`

- [ ] **Step 1: Update `TASKS.md`**

In the Frontend table, replace the `Theme-conditional hero badges/stats` row (`TASKS.md:43`) with two rows — one for badges (unchanged, still hardcoded) and one for the new stats work:

```markdown
| Theme-conditional hero badges | ✅ | `isUnity()` gates the 3 floating avatar badges only. Hardcoded per theme by design — out of scope for hero-stats work. |
| Editable hero stats | ✅ | `UserProfile` gained `ProjectsStatLabel`/`Stat2Label`/`Stat2Value`/`Stat3Label`/`Stat3Value` (`AddProfileStats` migration, backfilled for both seeds). Slot 1 is a `computed()` over the loaded `projects` count with an editable label; slots 2/3 are free-form label+value pairs from the admin panel. A slot renders only when its label and value are both non-empty; the divider between slots is emitted only between visible entries, so 1/2/3 visible slots all render cleanly. |
```

Then resolve the open question in the "Open Questions" section (`TASKS.md:59-64`) — replace it with:

```markdown
**Resolved:** Hero stats were promoted to profile data (see Frontend table) — slot 1 derives from project count, slots 2/3 are admin-editable label/value pairs. The floating avatar badges around the hero photo remain hardcoded per theme; only the stats were in scope.
```

- [ ] **Step 2: Update `AI_CONTEXT.md`**

In the `UserProfile` key-type block (`AI_CONTEXT.md:84-96`), add the five fields and a note on why they're strings:

```
UserProfile
  Id, Name, Role, Bio, PhotoUrl, CvUrl, Email
  Slug        ← unique index; used for routing + all new API lookups
  ThemeKey    ← default "unity"; drives body.theme-<key> (applied to document.body by ProfilePageComponent)
  ProjectsStatLabel, Stat2Label, Stat2Value, Stat3Label, Stat3Value  ← nullable strings; hero-stat
              content. Stat values are STRINGS (never parsed/summed), same rationale as Project.Downloads
              — they carry suffixes like "+"/"K"/"M"/"%". Slot 1's value isn't stored: it's derived from
              the profile's project count in ProfilePageComponent; only its label lives here.
```

Leave the rest of the block and the Gotchas section untouched.

- [ ] **Step 3: Commit**

```bash
git add TASKS.md AI_CONTEXT.md
git commit -m "docs: record hero-stats work and resolve the badges/stats open question"
```

---

## Self-Review Notes

- **Spec coverage:** schema (Task 1), API whitelist (Task 2), frontend service typing (Task 3), derived + editable rendering with divider fix (Task 4), admin form (Task 5), docs (Task 6) — all six spec sections have a task. The three requested commit chunks (migration+API, frontend render, admin form) map to Tasks 1+2, Task 4, and Task 5 respectively (Task 3 folds into Task 4's commit as noted, Task 6 is its own doc commit).
- **Placeholder scan:** no TBD/TODO markers; every step has literal code.
- **Type consistency:** `heroStats` return shape `{ label: string; value: string }[]` is identical across Task 4's implementation and spec. `UserProfile` field names (`projectsStatLabel`, `stat2Label`, `stat2Value`, `stat3Label`, `stat3Value`) are consistent across Tasks 1 (C# PascalCase, camelCase-serialized by ASP.NET Core's default JSON policy), 3, 4, and 5.
