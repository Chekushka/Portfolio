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
| Theme scope fix | ✅ | Was stale in this file — actually fixed in `c0b14eec` (theming moved from `:host.theme-*` to `body.theme-*`, applied to `document.body` via `Renderer2`). See `AI_CONTEXT.md` Gotchas. |
| Chooser preview panels (miniature /unity, /dotnet samples) | ✅ | Replaced the centered eyebrow/name/role/CTA text blob with a `.preview-panel` per half — paper/grid/coin/tag-chip sample for unity, dark/mono/code-symbol/pseudo-code sample for dotnet. Fluid via `clamp()` + `aspect-ratio`; verified at 1440/1024/390px and through the 35%–65% hover range. |
| Avatar frame dotnet leak | ✅ | Real bug (not the one originally suspected in `.profile-glow`/`.corner`, which were already var-based and correctly remapped): `.hero-visual`'s background gradient used literal `oklch()` values, invisible to the `body.theme-dotnet` var remap, rendering as a muddy warm/gray box on dark. Fixed by routing it through new `--c-frame-glow-1`/`-2` tokens, remapped to indigo/dark in `styles.scss`. |
| Theme-conditional hero badges/stats | ✅ | `isUnity()` (already existed) now gates the 3 floating badges and the 3-stat strip in `profile-page.component.html`. Dotnet: `ASP.NET CORE`/`EF CORE`/`REST API` badges, `APIS`/`ENDPOINTS`/`YRS XP` stats. Values are literal template strings, not parsed from `Downloads`. |
| Shell (nav/footer) theming | ✅ | New `ThemeService` (`activeTheme` signal) + `AppComponent` `@HostBinding('class')` returning `theme-<key>`/''. `ProfilePageComponent` sets/resets it alongside the existing body-class toggle. `app.component.scss` styles `.main-nav`/`.footer` under `:host(.theme-dotnet)`. Chooser/admin/login unaffected. |

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
- **Hero badges/stats: keep theme-hardcoded in the template, or promote to profile data
  (requires migration)?** Currently `isUnity()` gates literal strings in
  `profile-page.component.html` (badges + stat labels/numbers). Fine for two fixed
  profiles; would need a schema change (e.g. a `HeroBadges`/`HeroStats` field or table)
  if either profile's badges/stats need to change without a code deploy.

Global vs. per-profile contact methods/tags is resolved as "keep global by design"
(single owner's data — see `AI_CONTEXT.md`'s Key Data Types note); the Postgres cutover
question is resolved as "known debt, deferred" (see Infra/Content table above).

## Recommended Implementation Order
1. Replace placeholder seed values (email, CV, photos) with real data.
2. Add real .NET projects to the dotnet profile (otherwise `/dotnet` renders an empty grid).
3. Theme scope fix (see Frontend table) — background/content theme mismatch on the dotnet
   profile.
