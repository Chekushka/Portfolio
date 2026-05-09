# Deployment Notes

**Branch:** `dev`  
**Date:** 2026-05-09

---

---

## Contact Methods & Tag Icons (2026-05-09)

### Backend

| Area | Change |
|------|--------|
| `ContactMethod` model | New entity: `Id`, `Label`, `IconKey?`, `CustomIconUrl?`, `Url`, `Order`. |
| `ContactMethods` table | New table via `AddContactMethods` migration. |
| `ContactMethodsController` | New controller at `GET/POST/PUT/DELETE /api/ContactMethods` + `PUT /api/ContactMethods/reorder`. GET is public, others require JWT. POST rejects with 400 `MAX_CONTACT_METHODS` when count ≥ 5. |
| `Tag` model | Added nullable `IconKey` and `CustomIconUrl` columns. |
| `Tags` table | `AddTagIcons` migration adds two nullable columns — non-destructive, safe to apply to existing data. |
| `TagsController` | POST/PUT now accept `TagRequest` DTO (includes `IconKey`, `CustomIconUrl`). GET returns updated `TagDto` with icon fields. |

### Frontend

| Area | Change |
|------|--------|
| `assets/icons/` | 15 SVG files bundled: linkedin, github, telegram, whatsapp, discord, email, instagram, x, youtube, reddit, tiktok, phone, website, twitch, vk. |
| `IconPickerComponent` | New shared standalone component (`ControlValueAccessor`). Used in both tag and contact method admin forms. |
| `contact-method.service.ts` | New service: `getMethods`, `createMethod`, `updateMethod`, `deleteMethod`, `reorder`. |
| `tag.service.ts` | `Tag` interface gains `iconKey`/`customIconUrl`. New `TagRequest` interface. |
| `api.config.ts` | Added `contactMethods: 'ContactMethods'` endpoint. |
| `AdminComponent` | 4th "Contact" tab added with full CRUD + ↑↓ reorder. Tags form gains icon picker. |
| `HomeComponent` | Hero "Get in Touch" button replaced with contact icon row (shows only when ≥1 contact method configured). Tag badges show icon when `iconKey` or `customIconUrl` set. |

### Migration Risk

Both migrations are **additive/non-destructive** — no data loss.

**Run order:**
1. Deploy backend binaries.
2. Run `dotnet ef database update` (applies `AddContactMethods` and `AddTagIcons`).
3. Deploy frontend build.

---

## Possible Prod Errors (Contact Methods)

### `404` on `GET /api/ContactMethods`
**Cause:** `ContactMethodsController` not in deployed DLL.
**Fix:** Verify backend deployment is current.

### Contact icons not showing on home page
**Cause:** No contact methods configured yet, or `ContactMethods` table missing (migration not applied).
**Fix:** Apply migrations, then add contact methods in Admin → Contact tab.

### SVG icons render as broken images
**Cause:** `assets/icons/` not included in frontend deployment.
**Fix:** Verify `ng build` output includes `dist/.../assets/icons/*.svg`. Check Angular `assets` config in `angular.json`.

### `400 MAX_CONTACT_METHODS` when adding a method
**Cause:** Expected — max 5 contact methods enforced.
**Fix:** Delete an existing method before adding another.

---

## Project Editing Enhancements (2026-05-09)

### Backend

| Area | Change |
|------|--------|
| `Project` model | Removed `Platform` (string) and `Genre` (string). Added `VideoLayout` (string, default `"above"`). Added `Tags` navigation property (many-to-many). |
| `Tag` model | New entity: `Id`, `Name`, `Color` (hex string). |
| `ProjectTags` join table | New table created by EF migration. |
| `ProjectController` | Now accepts `ProjectRequest` DTO (with `TagIds: int[]`) and returns `ProjectResponse` DTO (with `Tags: TagDto[]`). Previously accepted/returned raw `Project` entity. |
| `TagsController` | New controller at `GET/POST/PUT/DELETE /api/Tags`. GET is public, others require JWT. |
| EF Migration | `AddTagsAndVideoLayout` — drops `Platform`/`Genre` columns, adds `VideoLayout`, creates `Tags` and `ProjectTags` tables. |

### Frontend

| Area | Change |
|------|--------|
| `app.config.ts` | Added `provideMarkdown()`. Removed duplicate `provideHttpClient()` call. |
| `api.config.ts` | Added `tags: 'Tags'` endpoint. |
| `tag.service.ts` | New service: `getTags`, `createTag`, `updateTag`, `deleteTag`. Exports `Tag` interface. |
| `project.service.ts` | Now typed: exports `Project` and `ProjectRequest` interfaces. `Project` has `tags: Tag[]` and `videoLayout` instead of `platform`/`genre`. |
| `MarkdownEditorComponent` | New standalone component. Toolbar + textarea + preview toggle. Implements `ControlValueAccessor` — works with `formControlName`. |
| `HomeComponent` | `Project` interface updated (no `platform`/`genre`, added `tags`, `videoLayout`). Modal description now rendered as Markdown. Card and modal tags rendered from `project.tags` array with inline `background-color`. Video layout classes `modal-layout-above` / `modal-layout-side` applied based on `project.videoLayout`. |
| `AdminComponent` | Full rewrite: 3-tab layout (Projects / Tags / Profile). Project form: removed `platform`/`genre`, added `videoLayout` radio and tag chip multi-select, replaced plain textarea with `MarkdownEditorComponent`. New Tags tab with CRUD. |

---

## Migration Risk

**The EF migration is destructive:**

- Drops `Platform` column from `Projects` table — **data lost permanently.**
- Drops `Genre` column from `Projects` table — **data lost permanently.**
- `dotnet ef database update` must be run manually on the production server.

**Run order:**
1. Deploy backend binaries.
2. Run `dotnet ef database update` (or apply migration SQL manually).
3. Deploy frontend build.

Do NOT deploy frontend before the migration runs — the API shape has changed and the old frontend will break against the new API.

---

## API Breaking Changes

Any client calling `GET /api/Project` will receive a different response shape:

**Before:**
```json
{
  "id": 1,
  "name": "...",
  "platform": "Google Play",
  "genre": "Puzzle",
  "downloads": "50,000+",
  ...
}
```

**After:**
```json
{
  "id": 1,
  "name": "...",
  "videoLayout": "above",
  "downloads": "50,000+",
  "tags": [{ "id": 1, "name": "Unity", "color": "#3b82f6" }],
  ...
}
```

`POST /api/Project` and `PUT /api/Project/{id}` now expect `tagIds: int[]` instead of `platform`/`genre`.

---

## Possible Prod Errors

### `column "Platform" does not exist` / `column "Genre" does not exist`
**Cause:** Migration not applied.  
**Fix:** Run `dotnet ef database update` on the server.

### `500` on `GET /api/Project` after migration
**Cause:** `ProjectController` tries to `.Include(p => p.Tags)` but `ProjectTags` table is missing.  
**Fix:** Same — run the migration.

### Blank project cards / no tags showing
**Cause:** Existing projects have no tags assigned. This is expected after migration — tags must be created in the Admin panel and assigned to projects.

### `NullReferenceException` on `project.Tags`
**Cause:** Old project rows returned without `.Include(p => p.Tags)`. Should not happen with updated `ProjectController`, but if you see it, verify the controller was deployed correctly.

### Admin panel: markdown editor not rendering
**Cause:** `provideMarkdown()` not in `app.config.ts`, or `ngx-markdown` not in `node_modules`.  
**Fix:** Verify `npm install` was run and `dist/` was rebuilt after the dependency was added.

### `404` on `GET /api/Tags`
**Cause:** `TagsController` not deployed, or route not registered.  
**Fix:** Verify backend deployment includes the new controller DLL.

### Tags chip border has no color (appears invisible)
**Cause:** `[style.--tag-color]` CSS custom property binding not supported in the deployed browser.  
**Workaround:** Switch to direct `[style.border-color]` binding if this appears in production. Modern browsers (Chrome 120+, Firefox 120+, Safari 17+) support it.

---

## Rollback

To roll back to the previous state:
1. Deploy the previous frontend build.
2. Run `dotnet ef database update <previous-migration-name>` to apply the Down migration (restores `Platform`/`Genre` columns, drops `Tags`/`ProjectTags`).
3. Deploy the previous backend binaries.

Note: any data entered into the `Tags` table or `videoLayout` field will be lost on rollback.
