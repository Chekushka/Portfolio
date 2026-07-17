# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in
this repository.

> For architecture depth, key-type invariants, and gotchas, read `AI_CONTEXT.md`.
> For current status and open questions, read `TASKS.md`. This file is the operational
> quick-reference (commands + constraints).

## Project Overview

Two-profile developer portfolio: ASP.NET Core 8 REST API backend + Angular 21 SPA
frontend, backed by SQLite (`portfolio.db`) locally, PostgreSQL-ready for prod. Root `/`
is a split-screen chooser between two profiles — `unity` and `dotnet` — each with its own
slug, theme, and ordered project list, all editable from a JWT-protected admin panel.

## Commands

### Backend (run from `Portfolio/`)
```powershell
dotnet run                        # Start API on port 5177
dotnet build                      # Build
dotnet ef migrations add <Name>   # Add EF migration
dotnet ef database update         # Apply migrations
```

### Frontend (run from `Portfolio-Client/`)
```powershell
npm install                       # Install dependencies
ng serve                          # Dev server at http://localhost:4200
ng build                          # Production build
npx vitest                        # Run unit tests
npx prettier --write src/         # Format code
```

## Architecture

### Backend (`Portfolio/`)

- **Two profiles**, seeded by the `AddMultiProfile` migration: `Id=1` slug `unity`,
  `Id=2` slug `dotnet`. The set is fixed in the seed — there is **no profile
  create/delete endpoint**; don't add multi-profile-create logic.
- `UserProfile` has `Slug` (unique index) and `ThemeKey` (default `"unity"`). `ThemeKey`
  is **seed-only** — `PUT /api/profile/{slug}` updates Name/Role/Bio/PhotoUrl/CvUrl/Email
  and deliberately ignores `Slug` and `ThemeKey`.
- `Project` has `ProfileId` (FK, `Restrict` delete) and `Order` (int, per-profile).
  `GET /api/project?profileId=` returns that profile's projects ordered by `Order`.
  `POST` auto-assigns `Order = max(sibling)+1`. `PUT /api/project/{id}/order` (body
  `{ direction: "up"|"down" }`) swaps `Order` with the adjacent sibling, returns 400 at a
  list boundary, and responds with the reordered list.
- Schema is managed by **EF migrations**, not `EnsureCreated()`. If you find an
  `EnsureCreated()` call in `Program.cs`, treat it as a bug — it conflicts with the
  migration pipeline (see `AI_CONTEXT.md` Gotchas).
- JWT is 1h expiry; credentials from `appsettings.json → AdminCredentials`.
- `ContactMethods`: up to 5 rows, ordered by `Order`, **global** (shared across both
  profiles). Max-5 enforced on POST (`MAX_CONTACT_METHODS`). Reorder via
  `PUT /api/ContactMethods/reorder` (body: `int[]` of ordered IDs).
- `Tags`: **global** (not profile-scoped). Nullable `IconKey`/`CustomIconUrl`
  (`AddTagIcons` migration). SVG icons in `Portfolio-Client/src/assets/icons/` (15 files).
  Resolution: `iconKey → /assets/icons/{key}.svg`, else `customIconUrl`, else no icon.
- A `ReorderRequest` DTO (`Direction` string) backs the project order endpoint.

### Frontend (`Portfolio-Client/src/app/`)

Angular 21 with **standalone components only** — no NgModules. Key patterns:
- Services use `inject()` for DI and `signal()`/`computed()` for reactive state
  (e.g. `AuthService.isLoggedIn`).
- `authInterceptor.ts` — functional HTTP interceptor, appends `Bearer <token>` to every
  outgoing request.
- `auth.guard.ts` — functional `CanActivateFn` gating `/admin`.
- API base URL and endpoint names centralized in `config/api.config.ts`.

Routes (**order matters** — `:slug` is greedy and must come after named paths):
```
/          → ChooserComponent (split-screen Unity | .NET picker)
/admin     → AdminComponent (authGuard)
/login     → LoginComponent
/:slug     → ProfilePageComponent (loads profile by slug, applies :host.theme-<key>)
/**        → redirect to /
```

`ProfilePageComponent` replaced the old `HomeComponent` (deleted, ~1400 lines). It carries
the Unity coin mini-game / HUD and adds slug routing + theme switching. **Do not reference
`HomeComponent`** — it no longer exists.

`ChooserComponent` renders a 50/50 split screen that expands on hover; keyboard-accessible;
stacks vertically on mobile.

Services map 1:1 to backend controllers: `auth.service.ts`, `project.service.ts`,
`profile.service.ts`, `tag.service.ts`, `contact-method.service.ts`. `ProfileService`
exposes `getBySlug`/`updateBySlug`; `ProjectService` exposes `getByProfileId`/
`reorderProject` (both fully typed — no `any` returns).

Admin panel: a profile switcher row (Unity | .NET) drives `activeProfile`; project
list/edit and profile-info form are scoped to the active profile. ↑↓ buttons on each
project call the reorder endpoint and refresh the list from its response; disabled at
boundaries. The slug field is read-only.

Shared component: `icon-picker/icon-picker.component.ts` — standalone
`ControlValueAccessor` for selecting a predefined SVG icon or pasting a custom URL. Used in
both the tag form and contact-method form. Value type:
`IconSelection { iconKey: string | null; customIconUrl: string | null }`.

## Key Constraints

- **Profiles are a fixed set of two** (seeded). Don't add create/delete-profile logic.
- **`ThemeKey` is seed-only.** A new/changed theme = migration + a `:host.theme-X` SCSS
  block in `profile-page.component.scss`, not an admin action.
- **Prefer `PUT /api/profile/{slug}`** over the legacy `PUT /api/profile` (no slug); the
  legacy one forces `Id=1` and can overwrite `Slug`/`ThemeKey` with empty strings.
- **`Downloads` is a string** display field, not an int.
- JWT secret and admin credentials live in `appsettings.json`. Do not commit real secrets
  — use `dotnet user-secrets` or environment-variable overrides for non-dev environments.
- CORS allows `localhost:4200` (dev), `chekuns.dev`, `www.chekuns.dev`, and the Vercel
  deployment URL. Add new origins to the `WithOrigins(...)` list in `Program.cs` when
  deploying to a new host.
