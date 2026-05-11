# Serhii Chekun — Developer Portfolio

A full-stack portfolio app built to showcase indie game projects, with a live interactive mini-game right on the landing page. Built from scratch with a custom CMS-style admin panel so content stays fresh without touching code.

**Live:** [chekuns.dev](https://chekuns.dev)

---

## What it does

- **Public portfolio** — hero section, floating coin mini-game, project grid with video modal previews
- **Admin panel** — full CRUD for projects, tags, profile, and contact links; protected by JWT auth
- **Headless CMS feel** — all content (bio, games, downloads count, social links) is editable from the UI

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, SCSS |
| Backend | ASP.NET Core 8, C# |
| Database | SQLite (local) / PostgreSQL (prod-ready) |
| Auth | JWT (1-hour expiry, auto-logout on 401) |
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
dotnet run            # API on http://localhost:5177

# Frontend (from Portfolio-Client/)
npm install
ng serve              # App on http://localhost:4200
```

See [Portfolio/README.md](Portfolio/README.md) and [Portfolio-Client/README.md](Portfolio-Client/README.md) for detailed setup.

---

## Highlights for recruiters

**Signals-based reactivity** — Angular 21 signals replace RxJS subjects for auth state, keeping the reactive model simple and explicit.

**JWT expiry on reconnect** — frontend decodes the `exp` claim on service initialization and clears stale tokens before any guard or API call fires.

**Pixel-art mini-game** — floating coins built entirely in CSS box-shadow (no canvas, no images). Keyboard-accessible.

**Clean REST API** — consistent `{ error: { code, message } }` error shape, correct HTTP status codes, no stack traces in responses.

**One-command deploy** — Dockerfile included; SSL via Let's Encrypt; secrets via environment variable overrides.
