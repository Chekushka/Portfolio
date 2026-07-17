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
| Legacy `/api/profile` GET/PUT (Id=1) | 🔶 | Still present alongside slug endpoints. PUT can wipe Slug/ThemeKey. Decide: keep or delete. |
| `EnsureCreated()` removal | 🔶 | Must be gone now that migrations own the schema — **verify** (see Open Questions). |

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

## Infra / Content
| Item | Status | Notes |
|---|---|---|
| CORS origins | ✅ | localhost:4200, chekuns.dev, www, Vercel URL. |
| Seed placeholder data | 🔶 | Seeded Email `hello@example.com`, CvUrl `#`, placehold.co photos. Replace with real values. |
| PostgreSQL prod cutover | ❌ | Provider is prod-ready but not exercised. Decide when to migrate off SQLite. |

## Open Questions
- [ ] **`EnsureCreated()` vs migrations** — is `EnsureCreated()` fully removed from
  `Program.cs`? If not, fresh-DB startup + `dotnet ef database update` will conflict.
  This is a factual code-state check, not a design call — resolve by reading `Program.cs`
  and delete this line once confirmed.
- [ ] **Legacy `/api/profile` pair** — keep for backward compat or delete? The PUT is a
  footgun (can null out Slug/ThemeKey). No known caller depends on it.
- [ ] **Theme editability** — should `ThemeKey` become editable (admin dropdown), or stay
  seed-only? Currently a third theme requires a migration + SCSS block. Design call.
- [ ] **Global vs per-profile contact methods / tags** — currently global by design.
  Confirm that's the intended long-term model before either profile's contact list grows.
- [ ] **Prod DB** — timeline for SQLite → PostgreSQL cutover.

## Recommended Implementation Order
1. Confirm/remove `EnsureCreated()` — unblocks any clean deploy or DB reset.
2. Decide fate of the legacy `/api/profile` pair; delete or document.
3. Replace placeholder seed values (email, CV, photos) with real data.
4. Add real .NET projects to the dotnet profile (otherwise `/dotnet` renders an empty grid).
5. Only then consider theme-editability and Postgres cutover.
