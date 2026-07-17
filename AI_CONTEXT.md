# Portfolio (chekuns.dev) — AI Context File

> **For AI assistants:** Read this file + `TASKS.md` before working on any task.
> Update `TASKS.md` as work progresses (status symbols, notes, resolved questions).
> Only touch this file when architecture/conventions actually change.

## What This Project Is

Personal developer portfolio at **chekuns.dev**. Originally a single-profile site;
as of the multi-profile update (tip `b99e60b3`) it serves **two selectable profiles**
— `unity` (game dev) and `dotnet` (.NET dev) — each with its own slug, theme, and
ordered project list. Root `/` is a split-screen chooser between the two. Content is
edited through a JWT-protected admin panel; nothing about the profiles requires a code
change to update copy, projects, tags, or contact links.

Backend: ASP.NET Core 8 REST API. Frontend: Angular 21 SPA. DB: SQLite locally
(`portfolio.db`), PostgreSQL-ready for prod.

Fuller design/implementation record: `docs/superpowers/2026-07-08-multi-profile.md`.

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | ASP.NET Core 8, C# | Controllers + EF Core, no MediatR/CQRS |
| ORM | EF Core (SQLite provider) | Schema via **migrations** — see Gotchas re `EnsureCreated` |
| DB | SQLite (`portfolio.db`) local / PostgreSQL prod-ready | |
| Auth | JWT, 1h expiry | Credentials from `appsettings.json → AdminCredentials` |
| Frontend | Angular 21, **standalone components only** | No NgModules anywhere |
| FE reactivity | Signals (`signal()`, `computed()`) + `inject()` DI | RxJS only where `HttpClient` forces Observables |
| FE tests | Vitest + Angular TestBed + `HttpTestingController` | |
| Styling | SCSS, CSS custom properties, `@keyframes` | Theme = a set of CSS var overrides under `:host.theme-*` |
| Hosting | Docker + VPS, Let's Encrypt SSL | |

Explicitly **not** used: NgModules, NgRx/RxJS state stores (signals instead),
server-side rendering, a component library (hand-rolled SCSS).

## Architecture

**Backend** — thin controllers over `AppDbContext`. No service layer between controller
and DbContext; controllers map entities ↔ DTOs inline. Request/response DTOs live in
`Api/Models/Dtos/`. Auth via `[Authorize]` on mutating endpoints; reads are public.

**Frontend** — standalone components; one Angular service per backend controller (1:1).
Services own all HTTP; components consume services and hold view state in signals.
Communication rules:
- Components never call `HttpClient` directly — always through a service.
- `authInterceptor` appends `Bearer <token>` to every outgoing request.
- `authGuard` (`CanActivateFn`) gates `/admin`.
- Auth state is a signal (`AuthService.isLoggedIn`), not an RxJS subject.

## Folder Map

```
Portfolio/                              ← ASP.NET Core 8 API
  Api/Models/                           ← entities: UserProfile, Project, Tag, ContactMethod
  Api/Models/Dtos/                      ← ProjectRequest/Response, ReorderRequest, TagDto
  Api/Data/AppDbContext.cs              ← DbSets, FK/index config, profile seed (both rows)
  Api/Data/Migrations/                  ← EF migrations (AddTagIcons, AddMultiProfile, ...)
  Api/Controllers/                      ← Profile, Project, Auth, Tag, ContactMethods
  Program.cs                            ← DI, CORS, JWT, dev seed
  appsettings.json                      ← AdminCredentials, JWT secret (do NOT commit real values)

Portfolio-Client/src/app/
  components/chooser/                   ← split-screen landing (Unity | .NET), root route
  components/profile-page/              ← per-slug profile page + theme host class (was HomeComponent)
  components/admin/                     ← CMS panel: profile switcher, project CRUD, ordering
  components/login/                     ←
  components/icon-picker/               ← ControlValueAccessor for SVG/custom-URL icons
  services/                            ← profile, project, tag, contact-method, auth (1:1 to controllers)
  config/api.config.ts                  ← base URL + endpoint names (single source)
  auth.guard.ts / authInterceptor.ts    ← functional guard + interceptor
  assets/icons/                         ← 15 bundled SVG icons

docs/superpowers/2026-07-08-multi-profile.md   ← multi-profile spec + step-by-step plan
```

**Removed by the multi-profile update — do not resurrect:**
`components/home/` (HomeComponent, ~1400 lines). Its game/HUD logic and template were
carried into `profile-page/`. Any reference to `HomeComponent` is stale.

## Key Data Types

```
UserProfile
  Id, Name, Role, Bio, PhotoUrl, CvUrl, Email
  Slug        ← unique index; used for routing + all new API lookups
  ThemeKey    ← default "unity"; drives :host.theme-<key> on the profile page
```
Invariants:
- Exactly **two** rows exist, seeded by `AddMultiProfile` (`Id=1` slug `unity`,
  `Id=2` slug `dotnet`). **No create/delete endpoint** — the set of profiles is fixed
  in the seed. Don't add multi-profile-create logic.
- `ThemeKey` is **seed-only**. `UpdateProfileBySlug` does not touch it (nor `Slug`).
  Changing a theme or adding a third = migration + a new `:host.theme-X` SCSS block.

```
Project
  Id, Name, Description
  Downloads      ← STRING, not int (display value, e.g. "100K+")
  VideoLayout    ← "above" | ... (layout hint for the video modal)
  VideoUrl?, MarketLink?, PreviewImageUrl?
  ProfileId      ← FK → UserProfile, delete behaviour Restrict
  Order          ← int, per-profile ordering (see below)
  Tags           ← many-to-many via ProjectTags join table
```
Invariants:
- `Order` is **scoped within a `ProfileId`**, 0-based, auto-assigned `max(sibling)+1`
  on POST. Reorder swaps `Order` with the adjacent sibling; the swap logic assumes
  distinct, contiguous orders per profile.
- Existing (pre-update) projects were migrated with `ProfileId=1` (Unity).

```
Tag           ← Id, Name, Color, IconKey?, CustomIconUrl?   (GLOBAL, not profile-scoped)
ContactMethod ← max 5 rows, ordered by Order                (GLOBAL, not profile-scoped)
```
Icon resolution: `iconKey → /assets/icons/{key}.svg`, else `customIconUrl`, else none.

## API Surface

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/profile` | — | Legacy: returns `Id=1`. See Gotchas. |
| GET | `/api/profile/{slug}` | — | Profile by slug (`unity`/`dotnet`). |
| PUT | `/api/profile` | ✔ | Legacy: forces `Id=1`, whole-entity Modified. **Avoid.** |
| PUT | `/api/profile/{slug}` | ✔ | Updates 6 fields; ignores `Slug`/`ThemeKey`. |
| GET | `/api/project?profileId=` | — | Projects for a profile, ordered by `Order`. |
| POST | `/api/project` | ✔ | Creates; auto-assigns `Order = max(sibling)+1`. |
| PUT | `/api/project/{id}` | ✔ | Update project. |
| DELETE | `/api/project/{id}` | ✔ | Delete project. |
| PUT | `/api/project/{id}/order` | ✔ | Body `{ direction: "up"\|"down" }`; swaps with sibling; 400 at boundary; returns reordered list. |
| PUT | `/api/ContactMethods/reorder` | ✔ | Body `int[]` of ordered IDs. |

Frontend routes (order matters — see Gotchas):
`/` → Chooser · `/admin` (guard) · `/login` · `/:slug` → ProfilePage · `**` → `/`.

## Service Dependency Map (frontend)

```
AuthService              ✅   isLoggedIn signal; decodes JWT `exp` on init, clears stale token
  └─ HttpClient
ProfileService           ✅   getProfile, getBySlug, updateProfile, updateBySlug
  └─ HttpClient
ProjectService           ✅   getProjects, getByProfileId, addProject, updateProject, deleteProject, reorderProject
  └─ HttpClient
TagService               ✅
ContactMethodService     ✅
authInterceptor          ✅   ← AuthService (token)
authGuard                ✅   ← AuthService (isLoggedIn)
```

## Coding Conventions

- Language-level C#/.NET style: see the `dotnet-dev` skill. This file lists only
  project-specific rules.
- Angular: standalone components, `inject()` for DI, `signal()`/`computed()` for state,
  functional guards/interceptors. No NgModules, no field-based DI.
- One service per controller; components never hit `HttpClient` directly.
- New API base/endpoint names go in `config/api.config.ts`, nowhere else.
- Secrets (JWT, admin creds) never committed — `dotnet user-secrets` / env overrides.

## What's Running Right Now

Multi-profile is merged (12 commits, `4d731014 → b99e60b3`). Unity profile (`Id=1`)
holds every pre-existing project. **Dotnet profile (`Id=2`) exists but has zero projects
until content is added.** Chooser is live at root; admin is scoped to the active profile
tab. Contact methods and tags remain global (shared across both profiles) — this was a
deliberate choice, not an oversight.

## Gotchas

- **Route order.** `:slug` is greedy and will swallow `admin`/`login` if placed before
  them. `admin` and `login` MUST precede `:slug` in `app.routes.ts`.
- **`EnsureCreated()` vs migrations.** These are mutually exclusive. The schema is now
  managed by migrations (`AddMultiProfile`). If `EnsureCreated()` still runs in
  `Program.cs`, it will create the schema out-of-band and break `database update` on a
  fresh DB. Confirm it's gone. (Open question — see `TASKS.md`.)
- **Legacy `PUT /api/profile`.** Forces `Id=1` and marks the whole entity Modified, so a
  body missing `Slug`/`ThemeKey` will overwrite them with empty strings. Use the
  `{slug}` variant. Consider removing the legacy pair entirely.
- **Dev seed FK.** `Program.cs` dev-seed must set `ProfileId=1`/`Order` on seeded
  projects, or fresh-DB startup fails the FK constraint.
- **Reorder + Tags.** The reorder sibling query must `Include(p => p.Tags)` or the
  returned projects come back tagless (was a real bug, fixed in `f3670b7a`). Keep the
  Include if that code is ever rewritten.
- **`Downloads` is a string**, not a number — don't parse/increment it as int.
- **FK is `Restrict`.** A profile with projects can't be deleted. Currently moot (no
  delete-profile endpoint), relevant if one is ever added.
