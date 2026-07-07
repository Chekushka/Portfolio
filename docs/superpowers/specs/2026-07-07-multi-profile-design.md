# Multi-Profile Portfolio Design

**Date:** 2026-07-07  
**Status:** Approved

## Overview

Add a second profile (`.NET Developer`) to the portfolio app. One admin panel manages both profiles. Projects are profile-scoped with drag-free ordering. A new split-screen chooser at root routes visitors to the right profile. The `.NET` profile gets a Minimal Monochrome theme with floating code-symbol background animation.

---

## Routing

| Route | Component | Notes |
|---|---|---|
| `/` | `ChooserComponent` | New — split-screen profile selector |
| `/unity` | `ProfilePageComponent` | Existing Unity profile |
| `/dotnet` | `ProfilePageComponent` | New .NET profile, same component |
| `/login` | `LoginComponent` | Unchanged |
| `/admin` | `AdminComponent` | Unchanged path, extended functionality |
| `/**` | redirect `""` | Unchanged |

HR links: send `chekuns.dev/dotnet` to .NET recruiters, `chekuns.dev/unity` to game studios. Neither sees the other profile unless they navigate to root.

---

## Backend

### DB Migration: `AddMultiProfile`

**`UserProfile`** — add columns:
- `Slug` (string, unique, indexed, non-nullable) — route identifier (`"unity"`, `"dotnet"`)
- `ThemeKey` (string, default `"unity"`) — consumed by frontend for theme switching

Remove singleton enforcement. `EnsureCreated` seeds both profiles: `Id=1, Slug="unity", ThemeKey="unity"` and `Id=2, Slug="dotnet", ThemeKey="dotnet"`. No admin UI to create profiles.

**`Project`** — add columns:
- `ProfileId` (int, FK → `UserProfile.Id`, non-nullable)
- `Order` (int, default `0`) — controls display order within a profile

### API Changes

| Method | Endpoint | Change |
|---|---|---|
| `GET` | `/api/profile/{slug}` | New — fetch profile by slug |
| `GET` | `/api/profile` | Unchanged — still returns `Id=1` (backward compat) |
| `PUT` | `/api/profile/{slug}` | New — update profile by slug |
| `GET` | `/api/projects?profileId={id}` | Extended — filter by profileId |
| `POST/PUT` | `/api/projects` | Extended — require `profileId` in body |
| `PUT` | `/api/projects/{id}/order` | New — body: `{ "direction": "up" \| "down" }` |

**Order swap logic:** `PUT /api/projects/{id}/order` finds the adjacent project (same `ProfileId`, sorted by `Order`) and swaps `Order` values. Returns updated list. Returns `400` if project is already first/last (no adjacent). Frontend disables ↑ on first item, ↓ on last item.

### What stays the same
- `ContactMethods` — global, not profile-scoped
- `Tags` — global, not profile-scoped
- `Auth` — single admin, unchanged

---

## Frontend

### `ProfilePageComponent` (replaces `HomeComponent`)

- Reads `:slug` from route params
- Calls `profileService.getBySlug(slug)` on init
- Applies theme class to host element: `theme-unity` or `theme-dotnet` based on `profile.themeKey`
- If slug not found → redirect to `""`
- Projects fetched via `projectService.getByProfileId(profile.id)`, displayed in `Order` sequence

### `ChooserComponent` (new, at `""`)

- Full-viewport split: left = Unity half, right = .NET half
- Each half shows: name, role title, subtle theme background preview (Unity: existing palette teaser; .NET: monochrome floating symbols teaser)
- **Hover interaction:** hovered half expands to `65%` width, other shrinks to `35%`. CSS transition: `width 0.4s cubic-bezier(0.4, 0, 0.2, 1)`
- **Click:** `router.navigate([slug])`
- Fetches both profiles on init for dynamic role/name display (two `GET /api/profile/{slug}` calls)
- Mobile: stacks vertically, no hover — two full-width tap targets

### Theme System

Theme class applied on `ProfilePageComponent` host element. Global `styles.scss` defines:

```scss
.theme-unity  { /* existing styles, unchanged */ }
.theme-dotnet { /* new monochrome styles below */ }
```

**`.theme-dotnet` design:**
- Background: `#080808`
- Accent: `#6366f1` (indigo)
- Text: `#ffffff` primary, `#444` secondary
- Font: system sans-serif, clean weight
- Background animation: floating code symbols (`{}` `</>` `[]` `()` `<T>` `=>` `??`) — CSS `@keyframes floatUp`, staggered delays, low opacity (`0.06–0.10`), slow speed (`6–11s`), slight rotation
- Subtle radial gradient: `radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.08), transparent 60%)`

### Admin Panel Changes

**Profile tabs:** `Unity | .NET` tabs at top of `AdminComponent`. Active profile stored as `activeProfile = signal<UserProfile>()`.

**Per-tab sections:**
- **Profile info:** edit `Role`, `Description`. `Slug` displayed read-only.
- **Projects:** list filtered by `activeProfile().id`. Each row has ↑ ↓ buttons calling `PUT /api/projects/{id}/order`. Add/Edit/Delete unchanged; `profileId` auto-set from active tab context.

**Global sections (no tab):**
- Contact Methods — unchanged, shared across both profiles
- Tags — unchanged, shared

---

## What Is NOT in Scope

- UI to create new profiles (admin can only edit existing two)
- Per-profile contact methods
- Per-profile tags
- Any profile deletion flow

---

## Open Questions (resolved)

| Question | Decision |
|---|---|
| Routing strategy | Path routing (`/:slug`) |
| Profile identity | `Slug` column on `UserProfile` |
| Project ordering UX | Up/Down arrow buttons |
| .NET theme | Minimal Monochrome (D) |
| Root `/` | Split-screen chooser with hover expand |
| Contact methods scope | Global (shared) |
| Tags scope | Global (shared) |
