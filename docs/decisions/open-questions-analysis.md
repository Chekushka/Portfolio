# Open Questions Analysis

> Investigates the five "Open Questions" in `TASKS.md` against actual code. Written as a
> brief for a human decision-maker — does not modify `TASKS.md`, `AI_CONTEXT.md`, or any
> source file.

---

## 1. `EnsureCreated()` vs migrations

**Classification: FACTUAL — resolved.**

### Evidence
- [Program.cs:62-77](../../Portfolio/Program.cs#L62-L77) — the only DB-initialization block in
  the app:
  ```csharp
  using (var scope = app.Services.CreateScope())
  {
      var services = scope.ServiceProvider;
      var context = services.GetRequiredService<AppDbContext>();

      context.Database.Migrate();   // ← line 67

      if (!context.Projects.Any())
      { ... }
  }
  ```
- `grep -n "EnsureCreated" Portfolio/**/*.cs` — zero matches anywhere in the backend.
- `grep -n "Database.Migrate\|MigrateAsync"` — exactly one hit, `Program.cs:67`.

### Findings
`EnsureCreated()` is **not present anywhere in the codebase**. `Program.cs` calls
`context.Database.Migrate()` on startup, which applies pending EF migrations and creates
(or updates) the `__EFMigrationsHistory` table correctly. There is no code path that could
race `EnsureCreated()` against `Migrate()` — only one initialization call exists.

`AI_CONTEXT.md`'s own tech-stack table (line 26) already says "Schema via **migrations**",
and its Gotchas section (lines 174-177) frames this as an open question to *confirm*, not a
known-broken state. The `TASKS.md` note is stale relative to the code: this was already
fixed, most likely in the same work that produced `72837b54` (`AddMultiProfile` migration)
or earlier — `Migrate()` is unconditional, not new/conditional code.

### Answer
**Already correct.** Fresh-DB startup runs `Migrate()`, which builds the schema via the
migration chain and populates `__EFMigrationsHistory` in lockstep. A subsequent
`dotnet ef database update` from the CLI will see the same history table and no-op cleanly.
No conflict exists. Recommend closing this open question outright — no code change needed,
just delete the item from `TASKS.md`.

*(Note: migration-history integrity has a separate, real issue — see §5, mixed
SQLite/Postgres provider annotations across the migration chain. That's a Postgres-cutover
concern, not an `EnsureCreated` concern.)*

---

## 2. Legacy `/api/profile` GET/PUT (`Id=1`)

**Classification: DECISION.**

### Evidence
- [ProfileController.cs:20-25](../../Portfolio/Api/Controllers/ProfileController.cs#L20-L25) — legacy GET:
  ```csharp
  [HttpGet]
  public async Task<IActionResult> GetProfile()
  {
      var profile = await _context.Profiles.FindAsync(1);
      return Ok(profile);
  }
  ```
- [ProfileController.cs:36-44](../../Portfolio/Api/Controllers/ProfileController.cs#L36-L44) — legacy PUT (the footgun):
  ```csharp
  [Authorize]
  [HttpPut]
  public async Task<IActionResult> UpdateProfile([FromBody] UserProfile updatedProfile)
  {
      updatedProfile.Id = 1;
      _context.Entry(updatedProfile).State = EntityState.Modified;
      await _context.SaveChangesAsync();
      return NoContent();
  }
  ```
  `EntityState.Modified` on the whole entity means **every** column is written, including
  `Slug` and `ThemeKey`. If the caller's JSON body omits them (or sends the C# default
  `string.Empty`, since `UserProfile.Slug`/`ThemeKey` are non-nullable with `= string.Empty`
  / `= "unity"` defaults — [UserProfile.cs:12-13](../../Portfolio/Api/Models/UserProfile.cs#L12-L13)),
  a call to this endpoint silently overwrites `Slug` to `""` and `ThemeKey` to whatever the
  body's model-binder produced (empty string if using a DTO without a default, `"unity"` if
  model-binding a fresh `UserProfile`, — either way, uncontrolled). This would break slug
  routing (`/:slug`) for profile 1 and require a manual DB fix to recover.
- Compare to the slug-scoped PUT, [ProfileController.cs:46-63](../../Portfolio/Api/Controllers/ProfileController.cs#L46-L63),
  which whitelists exactly 6 fields (`Name`, `Role`, `Bio`, `PhotoUrl`, `CvUrl`, `Email`) and
  never touches `Slug`/`ThemeKey`. This is the safe path.
- Frontend search — `grep -rn "getProfile\b|updateProfile\b" Portfolio-Client/src`:
  - `profile.service.ts:23` and `:31` — only the **definitions** of `getProfile()` /
    `updateProfile()`.
  - No component calls either. `grep -rn "profileService\."` across
    `Portfolio-Client/src` turns up exactly three callers, all using the slug-scoped API:
    - `chooser.component.ts:22-23` → `getBySlug('unity')` / `getBySlug('dotnet')`
    - `admin.component.ts:79-80` → `getBySlug('unity')` / `getBySlug('dotnet')`
    - `admin.component.ts:125` → `updateBySlug(slug, {...})`
    - `profile-page.component.ts:54` → `getBySlug(slug)`

### Findings
**Zero live callers**, frontend or otherwise (no other consumers exist in this repo — it's
a single-frontend project). The legacy pair is dead code that also happens to be a data
integrity hazard. This isn't really a close call, but framed as a DECISION per the
requested format since it's a delete-vs-keep call with real (if small) blast radius: any
external script, Swagger/Postman collection, or undiscovered caller hitting `GET/PUT
/api/profile` directly would break.

### Options
| Option | Effort | Risk | Blast radius |
|---|---|---|---|
| **A. Delete both endpoints now** | Trivial — remove 2 methods (~15 lines) from `ProfileController.cs` | Low — no in-repo caller found | Any *external* untracked caller (unlikely for a personal portfolio API with no public API contract) breaks with a 404 |
| **B. Keep GET, delete PUT only** | Trivial | Low | GET is harmless (read-only, returns profile 1); PUT is the only actual footgun. Halves the risk surface while keeping a "default profile" convenience route |
| **C. Keep both, document as deprecated** | Zero code change | The footgun stays loaded — a future admin-UI change or API client could hit `PUT /api/profile` by habit and silently corrupt `Slug`/`ThemeKey` | None today, but risk compounds over time |

### Recommendation
**Option A** (delete both). No known caller, confirmed by direct grep of the only frontend
in this repo. Option B is a reasonable fallback if the human wants a zero-slug convenience
GET for tooling/curl during development, but the PUT should go regardless — it's the one
piece of code in the entire API that can silently corrupt profile routing data.

---

## 3. `ThemeKey` editability

**Classification: DECISION.**

### Evidence — end-to-end trace
1. **Seed** — [AppDbContext.cs:34-59](../../Portfolio/Api/Data/AppDbContext.cs#L34-L59):
   `HasData` seeds exactly two rows, `Id=1` `ThemeKey="unity"`, `Id=2` `ThemeKey="dotnet"`.
   No other rows, no create-profile endpoint anywhere in `ProfileController.cs`.
2. **Model default** — [UserProfile.cs:13](../../Portfolio/Api/Models/UserProfile.cs#L13):
   `public string ThemeKey { get; set; } = "unity";`
3. **Update path ignores it** — `UpdateProfileBySlug`,
   [ProfileController.cs:48-62](../../Portfolio/Api/Controllers/ProfileController.cs#L48-L62),
   copies exactly `Name, Role, Bio, PhotoUrl, CvUrl, Email`. `ThemeKey` and `Slug` are never
   assigned from `updatedProfile` — confirmed, no line touches them. There is no other PUT
   route for `UserProfile` (the legacy PUT in §2 *would* touch it via blanket
   `EntityState.Modified`, but that's the footgun, not a sanctioned path).
4. **Host class binding** —
   [profile-page.component.ts:45-48](../../Portfolio-Client/src/app/components/profile-page/profile-page.component.ts#L45-L48):
   ```ts
   @HostBinding('class')
   get themeClass(): string {
     return `theme-${this.profile().themeKey || 'unity'}`;
   }
   ```
5. **SCSS consumption** —
   `grep -n "theme-" profile-page.component.scss` → all 12 matches are
   `:host.theme-dotnet { ... }` blocks (lines 1078-1198). There is **no** `:host.theme-unity`
   block — "unity" is implicitly the *base* (undecorated `:host`) styling, and `theme-dotnet`
   is the only override block. So today's SCSS encodes exactly **two** closed themes, one of
   which (`unity`) is really "the default, no override."

### Findings
`ThemeKey` is fully seed-only today, exactly as `AI_CONTEXT.md` claims (line 94) — verified
directly in the update-path code, not just documentation. There is no admin UI field for it
either (confirmed: `admin.component.ts:125`'s `updateBySlug` payload has no `themeKey` key).
Making it editable is not a small toggle — it interacts with a **closed set of hardcoded
SCSS blocks**, and there's no create-profile flow to make "N themes" meaningful yet (the
row count is fixed at 2 by the seed, no create/delete endpoint per `AI_CONTEXT.md:92-93`,
confirmed no such endpoint exists in `ProfileController.cs`).

### Options
| Option | Effort | Notes |
|---|---|---|
| **A. Stay seed-only (status quo)** | Zero | Correct as long as the profile count stays fixed at 2 and neither profile needs to swap its visual identity. Changing a theme is a migration + SCSS block either way — there's no world where this is *never* a deliberate code change, since it's tied 1:1 to hand-written CSS blocks. |
| **B. Admin-editable from a fixed set (dropdown of existing theme keys)** | Small-medium — add `ThemeKey` to `UpdateProfileBySlug`'s whitelist, add a `<select>` in `admin.component.html` bound to the known keys (`unity`, `dotnet`), validate server-side against that closed set to prevent garbage values (e.g. `themeKey="foo"` → no matching SCSS → falls through to base `:host` styling silently, per line 47's `|| 'unity'` fallback — not a crash, but a silent visual bug) | Only makes sense if the *intent* is "swap which visual skin an existing profile wears," e.g. giving the dotnet profile the unity look temporarily. Doesn't reduce the SCSS-authoring burden for new themes at all. |
| **C. Fully dynamic (open-ended ThemeKey + dynamic style loading)** | Large — would require restructuring the theme mechanism away from hardcoded `:host.theme-X` SCSS blocks entirely (e.g. CSS custom-property sets loaded per theme, or a themes table with color-token rows) | Only worth it if profile count is expected to grow past 2, or non-developers need to add themes without a code change. Given `AI_CONTEXT.md`'s explicit invariant that profile creation is out of scope ("don't add multi-profile-create logic," line 93), this is over-engineering for the current product shape. |

### Recommendation
**Option A (stay seed-only)**, with Option B as the pragmatic next step *only if* a concrete
need shows up (e.g. wanting to preview the dotnet profile in the unity skin). There's no
evidence in the code or docs of a near-term need for admin-editable themes, and the SCSS is
still hand-authored per theme regardless of which option is picked — editability doesn't
remove that cost, it just relocates *which* of the two existing themes a given profile uses.

---

## 4. Global vs per-profile `ContactMethods` / `Tags`

**Classification: DECISION.**

### Evidence — schema confirmation
- [Tag.cs](../../Portfolio/Api/Models/Tag.cs) — `Id, Name, Color, IconKey?, CustomIconUrl?`.
  No `ProfileId` field.
- [ContactMethod.cs](../../Portfolio/Api/Models/ContactMethod.cs) — `Id, Label, IconKey?,
  CustomIconUrl?, Url, Order`. No `ProfileId` field.
- [AppDbContext.cs:15-60](../../Portfolio/Api/Data/AppDbContext.cs#L15-L60) — `OnModelCreating`
  configures a FK + unique index only for `Project → UserProfile` (lines 24-32) and the
  `Project ↔ Tags` many-to-many join (lines 19-22). There is **no** FK, index, or any
  relationship configuration involving `ContactMethod` at all — it's a flat, unscoped table.
  `Tag` also has no FK back to `UserProfile`; the only relationship it participates in is the
  `ProjectTags` join table, which scopes tags to *projects*, not profiles.
- Frontend confirms the same shape: `profile-page.component.ts:62`,
  `this.contactMethodService.getMethods().subscribe(...)` — no `profileId` param, called
  once, same list rendered regardless of which slug loaded. `TagService` similarly has no
  profile-scoping call anywhere (`admin.component.ts:107`, `getTags()` — no params).

### Findings
Confirmed genuinely global — both tables lack a `ProfileId` column, a FK, and any
query-side filtering. Every profile page and the admin panel load the exact same
`ContactMethod`/`Tag` rows regardless of active profile. `AI_CONTEXT.md` (line 168) already
states this is deliberate, not an oversight, and the code fully supports that claim — there
is no half-finished scoping attempt anywhere (e.g. no orphaned `ProfileId` column that's
unused, no dead filter code).

**Cost of scoping either later:**
- New nullable-or-required `ProfileId` FK column on the target table + EF migration
  (mechanically identical to what `AddMultiProfile` already did for `Project`, so a known,
  bounded pattern in this codebase — see `72837b54`).
- Backfill: every existing `ContactMethod`/`Tag` row would need a `ProfileId` assigned
  (straightforward for `ContactMethod`, since the current 5-or-fewer rows presumably belong
  to "the person," ambiguous for `Tag`, since some tags may legitimately apply to projects
  under *either* profile going forward — e.g. a `"C#"` tag would sensibly appear on both a
  Unity and a .NET project. Splitting `Tag` per-profile means either duplicating shared tags
  or keeping a global `Tag` table with a *separate* profile-scoped visibility concept — more
  design work than a single migration.)
- Admin UI: the tag picker and contact-method form (`icon-picker` reuse, per
  `AI_CONTEXT.md:69`) would need a profile-scoping control, and `ContactMethodController`'s
  existing max-5 constraint (per `CLAUDE.md`) would need to become max-5-*per-profile*.
- `ContactMethods.reorder` endpoint (`PUT /api/ContactMethods/reorder`, body `int[]`) would
  need to reorder within a profile scope, not globally — same shape of change as the
  `Project` reorder endpoint already got in `3f9e55e1`.

**Does the current global model create a real conflict today?** No. `TASKS.md` itself
(line 39) notes the dotnet profile has zero projects yet, and there's no code or doc
evidence of contact-method or tag content that's profile-specific in intent (e.g. a
Unity-only Discord link that shouldn't show on the .NET page). The docs frame it as
"deliberate," and nothing in the current data contradicts that.

### Options
| Option | Effort | Trigger |
|---|---|---|
| **A. Keep both global (status quo)** | Zero | Correct while both profiles' contact info and tag vocab genuinely overlap (same person, same email/social links; tags like "C#", "Unity", "REST API" are meaningfully shared or cheaply co-relevant) |
| **B. Scope `ContactMethod` only** | Medium (FK + migration + reorder-endpoint scoping + admin form update) | If the two personas ever need different contact links (e.g. a Unity-specific Discord vs. a .NET-specific LinkedIn variant) — the more plausible of the two to diverge, since contact info is more "identity-flavored" than tags |
| **C. Scope `Tag` only** | Medium-large (same as B, plus the shared-tag ambiguity above needs a design decision — duplicate vs. many-to-many-with-profile) | If tag vocab actually diverges (unlikely — tags describe tech stack/genre, which is naturally reusable across a "Unity dev" and ".NET dev" persona sharing one person) |
| **D. Scope both** | Large | Only if both triggers above fire simultaneously |

### Recommendation
**Keep global (Option A)** until a concrete content need appears. If forced to pick a
trigger to watch for: **`ContactMethod` divergence is the more likely first crack** (a
Unity-audience Discord/itch.io link vs. a .NET-audience LinkedIn/GitHub link) — that's the
one worth revisiting first if/when dotnet-profile content gets filled in (`TASKS.md` line
39, still ❌). `Tag` scoping has a real design cost (shared vs. duplicated tags) that
shouldn't be taken on speculatively.

---

## 5. SQLite → PostgreSQL cutover

**Classification: DECISION.**

### Evidence — provider registration
- [Program.cs:28-29](../../Portfolio/Program.cs#L28-L29):
  ```csharp
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
  ```
  Hardcoded to `UseSqlite` — not provider-switched by config or environment.
- [appsettings.json:9-11](../../Portfolio/appsettings.json#L9-L11) (prod):
  `"DefaultConnection": "Data Source=/app/data/portfolio.db"` — a Docker-volume-style file
  path, consistent with `CLAUDE.md`'s "Docker + VPS" hosting note.
- [appsettings.Development.json:11-13](../../Portfolio/appsettings.Development.json#L11-L13):
  `"DefaultConnection": "Data Source=portfolio.db"` — same, local file.
- **Postgres is already referenced but unused at runtime** —
  [Portfolio.csproj](../../Portfolio/Portfolio.csproj) has both
  `Microsoft.EntityFrameworkCore.Sqlite` **and**
  `Npgsql.EntityFrameworkCore.PostgreSQL` (v8.0.11) as package references, but only the
  Sqlite provider is ever registered in `Program.cs`. The Npgsql package is dead weight
  today, kept from an earlier provider choice.

### Evidence — migration-history mismatch (the real blocker)
- The **first** migration,
  [`20260314144117_InitialPostgres.cs`](../../Portfolio/Migrations/20260314144117_InitialPostgres.cs),
  was scaffolded against the **Npgsql provider**:
  ```csharp
  using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
  ...
  Id = table.Column<int>(type: "integer", nullable: false)
      .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
  ```
  (lines 2, 18-19, 36-37). Its very name (`InitialPostgres`) confirms the project originally
  targeted Postgres.
- Every migration **since** — `AddTagsAndVideoLayout`, `AddContactMethods`, `AddTagIcons`,
  `AddMultiProfile` — was scaffolded against **Sqlite** instead:
  `grep -n "Sqlite:Autoincrement"` hits 8 times across
  `20260509141625_AddTagsAndVideoLayout.cs` alone (lines 79-80, 144-145, 152, 262-263,
  334-335), plus more in `AddContactMethods.cs:18`. None of these later files carry any
  `Npgsql:*` annotation.
- Net effect: **the migration chain is provider-mixed.** Migration 1 is Postgres-shaped,
  migrations 2-5 are SQLite-shaped. This currently "works" only because `Program.cs` runs
  everything through the SQLite provider, which silently ignores the foreign `Npgsql:*`
  annotation on migration 1 and just executes the generic `CreateTable`/`InsertData` calls.
  Point `UseNpgsql` at this same chain today and the SQLite-specific annotations
  (`Sqlite:Autoincrement`) on migrations 2-5 are the analogous problem in reverse — plus
  Postgres has no `Sqlite:Autoincrement` concept, so those migrations would need to be
  regenerated, not just replayed.

### Other portability risks
- **`HasData` seed values** — [AppDbContext.cs:34-59](../../Portfolio/Api/Data/AppDbContext.cs#L34-L59)
  are plain strings/ints, nothing SQLite-specific in the *values* themselves. Low risk.
- **Case sensitivity** — the new `Slug` unique index
  ([AppDbContext.cs:30-32](../../Portfolio/Api/Data/AppDbContext.cs#L30-L32)) relies on
  default string comparison. SQLite's default collation for `TEXT` is case-sensitive binary
  (`BINARY`); Postgres's default `text` comparison is also case-sensitive by default — so
  this specific case actually ports cleanly. Worth a smoke test on cutover regardless, since
  no explicit collation is set on either side (implicit behavior, not a guarantee).
- **No raw SQL** found anywhere in migrations (`grep -n "Sql("` → no hits) — good, nothing
  SQLite-dialect-specific in hand-written SQL to port.
- **`Downloads` as string, not int** ([Project.cs:8](../../Portfolio/Api/Models/Project.cs#L8)) —
  provider-agnostic, not a portability risk, just a modeling quirk noted in `CLAUDE.md`.

### Findings
The connection-string/provider swap itself (`UseSqlite` → `UseNpgsql`, update
`appsettings.json`) is trivial. The actual blocker is the **migration history**: it can't be
replayed as-is against Postgres because it's a hybrid of Npgsql-flavored and
Sqlite-flavored migration files. A clean cutover needs either (a) a fresh
`InitialPostgres`-style squash migration regenerated from the current model snapshot with
the Npgsql provider active, discarding the old file-by-file history, or (b) hand-editing
each of the 5 migration files to be provider-neutral or dual-annotated — (a) is far less
error-prone.

### Options
| Option | Effort | Risk | Notes |
|---|---|---|---|
| **A. Squash-and-regenerate**: drop `Migrations/`, re-scaffold a single `InitialPostgres_v2` migration from the current `AppDbContext` model with `UseNpgsql` active, apply to a fresh Postgres DB, manually port/reseed existing SQLite data via a one-off script | Medium (a few hours) | Low for a fresh deploy; **destructive for the migration history** — only safe because this is a personal-portfolio DB with no other consumers of `__EFMigrationsHistory` | Cleanest end state; matches "personal project" scale |
| **B. Dual-provider `Program.cs`**: branch on `builder.Environment` or a config flag between `UseSqlite`/`UseNpgsql`, keep both migration chains alive with provider-specific folders (EF Core supports this via multiple `DbContext`-per-provider or migration assemblies) | High | Medium — meaningfully more moving parts for a single-developer, single-environment project | Only justified if SQLite needs to keep working long-term (e.g. for local dev) *alongside* a Postgres prod — plausible, since `CLAUDE.md` explicitly keeps SQLite as the local dev DB |
| **C. Do nothing until forced** | Zero | Deferred risk — the mixed-annotation chain doesn't block anything *while* SQLite remains the only registered provider | Reasonable if VPS/Docker + SQLite-on-a-volume continues to meet uptime/scale needs, which for a personal portfolio it likely does indefinitely |

### Recommendation
**Option C now, Option A when triggered.** There's no evidence of a load, concurrency, or
backup need that SQLite-on-a-Docker-volume can't handle for a personal portfolio site.
Trigger to actually cut over: multi-instance deployment (SQLite doesn't support concurrent
writers across processes/containers) or a managed-Postgres offer that removes ops burden
(e.g. free-tier Neon/Supabase/Railway Postgres, which the existing `Npgsql` package
reference suggests was once evaluated). When triggered, use Option A — squash the migration
history rather than trying to reconcile the Npgsql/Sqlite-annotation split
file-by-file; keep `Microsoft.EntityFrameworkCore.Sqlite` in the `.csproj` for local dev
(matches `CLAUDE.md`'s "SQLite locally... PostgreSQL-ready for prod" framing) and gate the
provider choice in `Program.cs` behind environment, which is effectively Option B's config
branch but only reached at cutover time, not built speculatively now.

---

## Summary — ranked by urgency

1. **#2 Legacy `/api/profile` pair** — highest urgency of the real decisions: it's a live
   data-corruption footgun (confirmed no caller depends on it), costs almost nothing to
   remove, and every day it stays is a day someone could wire the admin UI to the wrong PUT
   route by habit.
2. **#1 `EnsureCreated()` vs migrations** — technically already resolved (no code change
   needed), but ranked second because closing it is zero-effort and removes stale-doc
   confusion for the next person reading `TASKS.md`.
3. **#5 SQLite → PostgreSQL** — no urgency today (Option C, do nothing), but flagged above
   #4/#3 because the migration-history mismatch is a landmine that gets *harder* to clean up
   the longer more Sqlite-flavored migrations pile on top of the original Npgsql one — worth
   the human being aware of it now even if the cutover itself waits.
4. **#4 Global vs per-profile contact/tags** — no current conflict, low urgency; only
   becomes relevant once the dotnet profile gets real content (`TASKS.md` line 39, still
   not started) and someone notices contact info or tags wanting to diverge.
5. **#3 ThemeKey editability** — lowest urgency; purely a nice-to-have UI convenience with
   no functional gap today (both profiles already display correctly via seed-only themes).
