# Project Editing Enhancements Design

**Date:** 2026-05-09  
**Status:** Approved  
**Scope:** Admin panel + home page modal

---

## Overview

Three coordinated enhancements to the project management system:

1. **Markdown rich text editor** — replace plain textarea with toolbar + preview
2. **Flexible tag system** — replace fixed `platform`/`genre` fields with a reusable tag library
3. **Video layout toggle** — per-project setting controlling modal video placement

---

## 1. Data Model & API

### Backend model changes (`Portfolio/Api/Models/`)

**`Project.cs`** — modify:
- Remove `Platform` (string) and `Genre` (string)
- Add `VideoLayout` (string, default `"above"`, values: `"above"` | `"side"`)
- Add navigation property: `ICollection<Tag> Tags` (via join table)

**`Tag.cs`** — new entity:
```csharp
public class Tag {
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Color { get; set; } = "#ffffff"; // hex
}
```

**`ProjectTag.cs`** — new join entity:
```csharp
public class ProjectTag {
    public int ProjectId { get; set; }
    public int TagId { get; set; }
}
```

**EF DbContext** — add `DbSet<Tag>` and `DbSet<ProjectTag>`, configure many-to-many relationship. One migration covers all schema changes.

### API changes

**New `TagsController`** (`/api/tags`):
- `GET /api/tags` — public, returns all tags
- `POST /api/tags` — auth-gated, creates tag
- `PUT /api/tags/{id}` — auth-gated, updates name/color
- `DELETE /api/tags/{id}` — auth-gated, deletes tag (cascades join rows)

**`ProjectsController`** — update DTOs:
- Remove `platform` and `genre` from request/response DTOs
- Add `tagIds: int[]` to create/update request DTOs
- Add `tags: [{id, name, color}]` to response DTOs
- Add `videoLayout: string` to request/response DTOs

---

## 2. Markdown Editor

### New component: `markdown-editor.component.ts` (standalone)

**Toolbar buttons:** Bold, Italic, Unordered list, Ordered list, Code block, Link  
**Modes:** "Edit" (raw textarea) / "Preview" (rendered via `ngx-markdown`)  
**Interface:** Implements `ControlValueAccessor` — drops into existing `projectForm.description` control  

### Dependency

Install `ngx-markdown` (single package). Used for both editor preview and home page rendering.

### Home page modal

Replace `{{ proj.description }}` with `<markdown [data]="proj.description">` in `home.component.html`.

**Security:** `ngx-markdown` sanitizes output via Angular's `DomSanitizer` by default. Keep default `sanitize: true` — do not disable it.

---

## 3. Tags Admin Section

### New "Tags" tab in admin panel

**Tag library view:**
- List of all tags: color swatch + name + Edit / Delete buttons
- Create form: name input + `<input type="color">` + Save

**Edit:** pre-fills form with existing tag values  
**Delete:** removes tag and all `ProjectTag` join rows (cascade)

### Tag assignment in project form

- Multi-select chip area showing all available tags (color-coded)
- Click chip to toggle selection; selected chips visually distinguished
- Submits selected tag IDs as `tagIds[]`

---

## 4. Video Layout Toggle

### Admin project form

New radio group field "Video Layout":
- `"above"` — video stacked above description (default)
- `"side"` — video left (~50% width), description scrollable right

### Home page modal behavior

- `videoLayout === "above"`: video on top, description below (flex column)
- `videoLayout === "side"`: flex row — video left half, description right half
- Only applies when `videoUrl` is present; image fallback ignores layout setting

---

## 5. Admin Panel Button Visibility

All buttons in the admin panel must have explicit, high-contrast color/background styles. No transparent, ghost, or low-contrast button variants that could disappear against the panel background.

---

## Affected Files

### Backend
- `Portfolio/Api/Models/Project.cs`
- `Portfolio/Api/Models/Tag.cs` (new)
- `Portfolio/Api/Models/ProjectTag.cs` (new)
- `Portfolio/Api/Data/ApplicationDbContext.cs`
- `Portfolio/Api/Controllers/ProjectsController.cs`
- `Portfolio/Api/Controllers/TagsController.cs` (new)
- EF migration (new)

### Frontend
- `Portfolio-Client/src/app/components/admin/admin.component.ts`
- `Portfolio-Client/src/app/components/admin/admin.component.html`
- `Portfolio-Client/src/app/components/home/home.component.ts`
- `Portfolio-Client/src/app/components/home/home.component.html`
- `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.ts` (new)
- `Portfolio-Client/src/app/components/markdown-editor/markdown-editor.component.html` (new)
- `Portfolio-Client/src/app/services/tag.service.ts` (new)
- `Portfolio-Client/src/app/services/project.service.ts`
- `Portfolio-Client/src/app/config/api.config.ts`

---

## Out of Scope

- Markdown image upload (description links to external URLs only)
- Tag ordering / priority
- Tag search/filter on home page
- Multiple profiles
