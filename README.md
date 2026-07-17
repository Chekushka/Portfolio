# Serhii Chekun — Developer Portfolio

A full-stack portfolio that presents **two developer profiles from one codebase** — a
Unity/game-dev profile and a .NET profile — behind a split-screen chooser. Each profile
has its own slug, theme, and independently ordered project list, all managed through a
custom CMS-style admin panel so content stays fresh without touching code.

**Live:** [chekuns.dev](https://chekuns.dev)

---

## What it does

- **Split-screen chooser** — the landing page (`/`) is a 50/50 Unity | .NET picker that
  expands on hover and is fully keyboard-navigable; it stacks vertically on mobile.
- **Two themed profiles** — `/unity` (warm, game aesthetic with a floating-coin
  mini-game) and `/dotnet` (monochrome dark with animated code-symbol particles). Theme is
  driven by a `themeKey` on the profile and applied as a host CSS class.
- **Per-profile project ordering** — projects belong to a profile and carry an explicit
  order; the admin panel reorders them with ↑↓ buttons.
- **Admin panel** — profile switcher plus full CRUD for projects, tags, profile info, and
  contact links; protected by JWT auth.
- **Headless CMS feel** — bio, projects, download counts, and social links are all
  editable from the UI.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 (standalone components, signals), TypeScript, SCSS |
| Backend | ASP.NET Core 8, C#, EF Core |
| Database | SQLite (local) / PostgreSQL (prod-ready) |
| Auth | JWT (1-hour expiry, auto-logout on 401) |
| Tests | Vitest + Angular TestBed |
| Hosting | Docker-ready; deployed on VPS with SSL |

## Project structure

```
Portfolio/            ← ASP.NET Core 8 REST API
Portfolio-Client/     ← Angular 21 SPA
```

## Quick start

**Requirements:** .NET 8 SDK, Node.js 20+

```bash
# Backend (from Portfolio/)
dotnet ef database update   # apply migrations (creates portfolio.db)
dotnet run                  # API on http://localhost:5177

# Frontend (from Portfolio-Client/)
npm install
ng serve                    # App on http://localhost:4200
```

See [Portfolio/README.md](Portfolio/README.md) and
[Portfolio-Client/README.md](Portfolio-Client/README.md) for detailed setup.

---

## Highlights for recruiters

**One codebase, two audiences** — a single Angular app serves distinct Unity and .NET
profiles selected at the root, each with its own routing slug, theme, and ordered content —
no duplicated frontend.

**Signals-based reactivity** — Angular 21 signals replace RxJS subjects for auth and view
state, keeping the reactive model explicit; RxJS appears only where `HttpClient` requires
it.

**JWT expiry on reconnect** — the frontend decodes the `exp` claim on service
initialization and clears stale tokens before any guard or API call fires.

**Order-aware REST API** — projects are scoped and ordered per profile; a dedicated
reorder endpoint swaps adjacent items server-side and returns the corrected list, with
proper 400s at list boundaries.

**Pixel-art mini-game** — floating coins built entirely in CSS `box-shadow` (no canvas, no
images). Keyboard-accessible.

**Clean REST API** — consistent `{ error: { code, message } }` error shape, correct HTTP
status codes, no stack traces in responses.

**One-command deploy** — Dockerfile included; SSL via Let's Encrypt; secrets via
environment-variable overrides.
