# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack developer portfolio app: ASP.NET Core 8 REST API backend + Angular 21 SPA frontend, backed by a local SQLite database (`portfolio.db`).

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

- Profile (`Id=1`) is **not seeded** — create manually or via `PUT /api/profile`.
- JWT is 24h expiry; credentials sourced from `appsettings.json → AdminCredentials`.
- DB auto-created via `EnsureCreated()` on first run (`portfolio.db`).
- `ContactMethods` table: up to 5 rows, ordered by `Order`. Controller enforces max-5 on POST with `MAX_CONTACT_METHODS` error. Reorder via `PUT /api/ContactMethods/reorder` (body: `int[]` of ordered IDs).
- `Tags` table has nullable `IconKey` and `CustomIconUrl` columns added via `AddTagIcons` migration.
- SVG icons bundled in `Portfolio-Client/src/assets/icons/` (15 files). Icon resolution: `iconKey → /assets/icons/{key}.svg`, else `customIconUrl`, else no icon.

### Frontend (`Portfolio-Client/src/app/`)

Angular 21 with **standalone components only** — no NgModules. Key patterns:
- Services use `inject()` for DI and `signal()` for reactive state (e.g., `AuthService.isLoggedIn`).
- `authInterceptor.ts` — functional HTTP interceptor that appends `Bearer <token>` to every outgoing request.
- `auth.guard.ts` — functional `CanActivateFn` that gates the `/admin` route.
- API base URL and endpoint names are centralized in `config/api.config.ts`.

Routes: `/` (home, public) → `/login` → `/admin` (protected).

Services map 1:1 to backend controllers: `auth.service.ts`, `project.service.ts`, `profile.service.ts`, `tag.service.ts`, `contact-method.service.ts`.

Shared components: `icon-picker/icon-picker.component.ts` — standalone `ControlValueAccessor` for selecting a predefined SVG icon or pasting a custom URL. Used in both the tag form and contact method form. Value type: `IconSelection { iconKey: string | null; customIconUrl: string | null }`.

## Key Constraints

- The profile is a **singleton** (always `Id=1`); don't add logic to create multiple profiles.
- JWT secret and admin credentials live in `appsettings.json`. Do not commit real secrets — use `dotnet user-secrets` or environment variable overrides for non-dev environments.
- CORS allows `localhost:4200` (dev), `chekuns.dev`, `www.chekuns.dev`, and the Vercel deployment URL. Add new origins to the `WithOrigins(...)` list in `Program.cs` when deploying to a new host.
