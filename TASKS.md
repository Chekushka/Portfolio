# TASKS

> Read `AI_CONTEXT.md` first, then this file. Update status symbols and notes as work
> lands. Group by system, not by date.

## Status Legend
| Symbol | Meaning |
|---|---|
| ✅ | Fully implemented, no TODOs remaining |
| 🔶 | Partial — some of it done, some still stubbed/missing |
| ❌ | Not started |

## Backend
| Item | Status | Notes |
|---|---|---|
| `UserProfile` Slug/ThemeKey | ✅ | Unique index on Slug; ThemeKey default "unity". |
| `Project` ProfileId/Order | ✅ | FK Restrict; Order per-profile, 0-based. |
| `ReorderRequest` DTO | ✅ | `{ direction }`. |
| `AddMultiProfile` migration | ✅ | Seeds unity on Id=1, inserts dotnet Id=2; defaults ProfileId=1/Order=0 on existing rows. |
| Profile GET/PUT by slug | ✅ | PUT ignores Slug/ThemeKey by design. |
| Project profileId filter + ordered GET | ✅ | |
| Project reorder endpoint | ✅ | Swaps with sibling; 400 at boundary; returns list w/ Tags included. |
| Project POST auto-Order | ✅ | `max(sibling)+1` per profile. |
| Dev seed FK fix (`Program.cs`) | ✅ | Sets ProfileId=1/Order to survive fresh-DB startup. |
| Legacy `/api/profile` GET/PUT (Id=1) | ✅ | Removed — no in-repo caller, PUT could wipe Slug/ThemeKey. Slug-scoped endpoints are now the only profile routes. |
| Schema via `Database.Migrate()` | ✅ | `Program.cs` calls `context.Database.Migrate()` on startup; no `EnsureCreated()` anywhere. |

## Frontend
| Item | Status | Notes |
|---|---|---|
| `ProfileService` typed + getBySlug/updateBySlug | ✅ | `any` returns replaced with typed Observables. |
| `ProjectService` typed + getByProfileId/reorderProject | ✅ | |
| `ProfilePageComponent` (slug + theme host class) | ✅ | Replaces deleted HomeComponent; inherits coin game + HUD. |
| `ChooserComponent` (split-screen) | ✅ | Hover-expand, keyboard-accessible, mobile stacks vertically. |
| Routes rewired (`/`→Chooser, `/:slug`→ProfilePage) | ✅ | admin/login ordered before `:slug`. |
| Admin profile switcher + scoped CRUD | ✅ | `forkJoin`-style dual load; `updateBySlug`; read-only slug field. |
| Admin ↑↓ order buttons | ✅ | Disabled at list boundaries; list refreshed from reorder response. |
| Service unit tests (profile/project) | ✅ | Vitest + HttpTestingController. |
| Dotnet profile content (projects) | ❌ | Profile row exists, zero projects. Needs real .NET project entries + copy. |
| Theme scope fix | ❌ | Theme currently applies only inside `.portfolio-wrapper` via `@HostBinding` on the component host; page background (`body`) stays default, so the dotnet dark theme renders as a dark box on a light page. Fix: lift theming to body/`:root` level (toggle a body class in `ngOnInit`/`ngOnDestroy`, define themes as CSS variable sets in global `styles.scss`) so background and content share one theme source. (Theme *editability* was considered and rejected — themes stay seed-only; admin-editable, per-profile theme swapping is not planned.) |

## Infra / Content
| Item | Status | Notes |
|---|---|---|
| CORS origins | ✅ | localhost:4200, chekuns.dev, www, Vercel URL. |
| Seed placeholder data | 🔶 | Seeded Email `hello@example.com`, CvUrl `#`, placehold.co photos. Replace with real values. |
| PostgreSQL prod cutover | ❌ | Provider is prod-ready but not exercised. Decide when to migrate off SQLite. |

**Known debt:** the unused `Npgsql.EntityFrameworkCore.PostgreSQL` package reference has been
removed from `Portfolio.csproj`. The March `InitialPostgres` migration remains structurally
the first migration in the chain but is no longer Npgsql-annotated (annotations stripped so
the build doesn't require the package) — it's harmless under SQLite either way. A full squash
of the migration chain is only needed if a real Postgres cutover happens — defer until then.

## Open Questions
None currently open. Global vs. per-profile contact methods/tags is resolved as "keep
global by design" (single owner's data — see `AI_CONTEXT.md`'s Key Data Types note); the
Postgres cutover question is resolved as "known debt, deferred" (see Infra/Content table
above).

## Recommended Implementation Order
1. Replace placeholder seed values (email, CV, photos) with real data.
2. Add real .NET projects to the dotnet profile (otherwise `/dotnet` renders an empty grid).
3. Theme scope fix (see Frontend table) — background/content theme mismatch on the dotnet
   profile.
