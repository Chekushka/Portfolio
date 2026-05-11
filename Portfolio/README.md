# Portfolio API — ASP.NET Core 8

REST API backend for the portfolio app. Handles content management (projects, tags, profile, contact links) and JWT authentication for the admin panel.

## Stack

- **ASP.NET Core 8** — minimal hosting model, attribute routing
- **Entity Framework Core 8** — code-first migrations
- **SQLite** (dev) / **PostgreSQL** (prod-ready via Npgsql)
- **JWT Bearer** — 1-hour tokens, credentials in `appsettings.json`
- **Swagger / OpenAPI** — auto-generated at `/swagger`

## Running locally

```bash
cd Portfolio
dotnet run
# API: http://localhost:5177
# Swagger: http://localhost:5177/swagger
```

```bash
dotnet build          # build only
dotnet test           # run tests
```

## Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/login` |
| Profile | `GET/PUT /api/profile` |
| Projects | `GET/POST/PUT/DELETE /api/projects` |
| Tags | `GET/POST/PUT/DELETE /api/tags` |
| Contact Methods | `GET/POST/PUT/DELETE /api/contactmethods`, `PUT /api/contactmethods/reorder` |

All write endpoints require `Authorization: Bearer <token>`.

## Database

SQLite database (`portfolio.db`) is auto-created on first run via `EnsureCreated()`.

```bash
# Add a migration
dotnet ef migrations add <MigrationName>

# Apply migrations
dotnet ef database update
```

**Profile** is a singleton (always `Id=1`) — create it once via `PUT /api/profile`. It is not seeded.

## Configuration

`appsettings.json`:

```json
{
  "AdminCredentials": {
    "Username": "admin",
    "Password": "change-me"
  },
  "Jwt": {
    "Key": "your-secret-key"
  }
}
```

For production use environment variable overrides or `dotnet user-secrets` — do not commit real credentials.

## Error responses

All errors return a consistent shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found."
  }
}
```

## Docker

```bash
docker build -t portfolio-api .
docker run -p 5177:5177 portfolio-api
```
