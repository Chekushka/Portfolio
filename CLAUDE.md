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

`Program.cs` configures everything: EF Core (SQLite), JWT Bearer auth, CORS, Swagger, and seeds the database on startup (Projects only — Profile is not seeded, create it manually or via the PUT endpoint).

Controllers live in `Api/Controllers/`:
- `AuthController` — `POST /api/auth/login` returns a JWT (24h expiry). Credentials come from `appsettings.json → AdminCredentials`.
- `ProjectController` — public GET, JWT-protected POST/PUT/DELETE for portfolio projects.
- `ProfileController` — public GET, JWT-protected PUT for the single developer profile (Id=1; not auto-seeded, must exist in the DB).

Models and `AppDbContext` are in `Api/Models/` and `Api/Data/`. Migrations are in `Migrations/`.

The SQLite database file (`portfolio.db`) is created automatically via `EnsureCreated()` on first run.

Configuration keys in `appsettings.json`:
- `JwtSettings` — `SecretKey`, `Issuer`, `Audience`
- `AdminCredentials` — `Username`, `Password`

### Frontend (`Portfolio-Client/src/app/`)

Angular 21 with **standalone components only** — no NgModules. Key patterns:
- Services use `inject()` for DI and `signal()` for reactive state (e.g., `AuthService.isLoggedIn`).
- `authInterceptor.ts` — functional HTTP interceptor that appends `Bearer <token>` to every outgoing request.
- `auth.guard.ts` — functional `CanActivateFn` that gates the `/admin` route.
- API base URL and endpoint names are centralized in `config/api.config.ts`.

Routes: `/` (home, public) → `/login` → `/admin` (protected).

Services map 1:1 to backend controllers: `auth.service.ts`, `project.service.ts`, `profile.service.ts`.

## Key Constraints

- The profile is a **singleton** (always `Id=1`); don't add logic to create multiple profiles.
- JWT secret and admin credentials live in `appsettings.json`. Do not commit real secrets — use `dotnet user-secrets` or environment variable overrides for non-dev environments.
- CORS allows `localhost:4200` (dev), `chekuns.dev`, `www.chekuns.dev`, and the Vercel deployment URL. Add new origins to the `WithOrigins(...)` list in `Program.cs` when deploying to a new host.
