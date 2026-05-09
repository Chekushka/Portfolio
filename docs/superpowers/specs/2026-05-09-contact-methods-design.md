# Contact Methods & Tag Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add up to 5 customizable contact method links (with icons) to the hero section, replacing the current contact button; add icon support to tags.

**Architecture:** New `ContactMethods` DB table (own controller + service); `Tag` entity gains two nullable icon columns; shared `IconPickerComponent` (ControlValueAccessor) used in both contact and tag forms; ~15 SVG icons bundled in `assets/icons/`.

**Tech Stack:** ASP.NET Core 8, EF Core + SQLite, Angular 21 standalone components, signals, Reactive Forms, ControlValueAccessor.

---

## Data Model

### `ContactMethod` entity (new)

| Field | Type | Notes |
|-------|------|-------|
| `Id` | `int` PK | |
| `Label` | `string` | e.g. "LinkedIn", "Telegram" |
| `IconKey` | `string?` | Matches SVG filename without extension |
| `CustomIconUrl` | `string?` | Used when no predefined icon fits |
| `Url` | `string` | Link target |
| `Order` | `int` | Display order, 0-based |

Max 5 rows enforced in POST handler.

### `Tag` entity (updated)

Add two nullable columns:
- `IconKey string?`
- `CustomIconUrl string?`

### Icon resolution order

`iconKey` → `/assets/icons/{iconKey}.svg` → if null, use `customIconUrl` → if null, show no icon.

---

## Bundled Icon Set

SVG files in `Portfolio-Client/src/assets/icons/`. Source: Simple Icons (CC0 / MIT).

| Key | Service |
|-----|---------|
| `linkedin` | LinkedIn |
| `github` | GitHub |
| `telegram` | Telegram |
| `whatsapp` | WhatsApp |
| `discord` | Discord |
| `email` | Email (envelope) |
| `instagram` | Instagram |
| `x` | X / Twitter |
| `youtube` | YouTube |
| `reddit` | Reddit |
| `tiktok` | TikTok |
| `phone` | Phone |
| `website` | Globe / Website |
| `twitch` | Twitch |
| `vk` | VK |

---

## Backend

### New `ContactMethodsController` — `/api/ContactMethods`

| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | `/api/ContactMethods` | public | Returns all, ordered by `Order` |
| POST | `/api/ContactMethods` | JWT | Rejects with 400 if count ≥ 5 |
| PUT | `/api/ContactMethods/{id}` | JWT | |
| DELETE | `/api/ContactMethods/{id}` | JWT | |
| PUT | `/api/ContactMethods/reorder` | JWT | Body: `int[]` of ordered IDs |

**DTOs:**

```csharp
// ContactMethodRequest
public record ContactMethodRequest(
    string Label,
    string? IconKey,
    string? CustomIconUrl,
    string Url,
    int Order
);

// ContactMethodResponse
public record ContactMethodResponse(
    int Id,
    string Label,
    string? IconKey,
    string? CustomIconUrl,
    string Url,
    int Order
);
```

### Updated `TagsController`

`POST` and `PUT` now accept and return `IconKey` and `CustomIconUrl` via updated `TagDto` and a new `TagRequest` DTO.

**Updated DTOs:**

```csharp
// TagDto (response)
public record TagDto(int Id, string Name, string Color, string? IconKey, string? CustomIconUrl);

// TagRequest (create/update)
public record TagRequest(string Name, string Color, string? IconKey, string? CustomIconUrl);
```

### EF Migrations

1. **`AddContactMethods`** — creates `ContactMethods` table.
2. **`AddTagIcons`** — adds `IconKey` and `CustomIconUrl` columns to `Tags` table.

Both migrations are reversible.

---

## Frontend

### File structure

| Action | Path |
|--------|------|
| Create | `src/assets/icons/*.svg` (×15) |
| Create | `src/app/components/icon-picker/icon-picker.component.ts` |
| Create | `src/app/services/contact-method.service.ts` |
| Modify | `src/app/services/tag.service.ts` — add icon fields to `Tag` interface |
| Modify | `src/app/config/api.config.ts` — add `contactMethods: 'ContactMethods'` |
| Modify | `src/app/components/admin/admin.component.ts` — new Contact tab, icon picker in tag form |
| Modify | `src/app/components/admin/admin.component.html` — Contact tab UI, tag icon picker |
| Modify | `src/app/components/admin/admin.component.scss` — icon picker grid styles, contact list styles |
| Modify | `src/app/components/home/home.component.ts` — load contact methods, updated Tag interface |
| Modify | `src/app/components/home/home.component.html` — replace contact button with icon row; show tag icons |
| Modify | `src/app/components/home/home.component.scss` — contact icon button styles |

### `IconPickerComponent`

**Path:** `src/app/components/icon-picker/icon-picker.component.ts`

Standalone, `ChangeDetectionStrategy.OnPush`, implements `ControlValueAccessor`.

**Value type:**
```typescript
export interface IconSelection {
  iconKey: string | null;
  customIconUrl: string | null;
}
```

**Template structure:**
- Grid of predefined icon buttons (4–5 per row)
- Each renders `<img src="/assets/icons/{key}.svg" alt="{key}">`
- Selected icon highlighted with accent-colored border
- Below grid: text input labelled "Or paste icon URL" bound to `customIconUrl`
- Selecting a predefined icon clears `customIconUrl`; typing in the URL field clears `iconKey`

**Hardcoded icon list** in component:
```typescript
const ICONS = [
  'linkedin','github','telegram','whatsapp','discord',
  'email','instagram','x','youtube','reddit',
  'tiktok','phone','website','twitch','vk'
];
```

### `ContactMethodService`

**Path:** `src/app/services/contact-method.service.ts`

```typescript
export interface ContactMethod {
  id: number;
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}

export interface ContactMethodRequest {
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}
```

Methods: `getMethods()`, `createMethod(r)`, `updateMethod(id, r)`, `deleteMethod(id)`, `reorder(ids: number[])`.

### Updated `Tag` interface (tag.service.ts)

```typescript
export interface Tag {
  id: number;
  name: string;
  color: string;
  iconKey: string | null;
  customIconUrl: string | null;
}
```

### Admin panel — Contact tab (4th tab)

Form fields: Label (text input), URL (text input), `<app-icon-picker formControlName="icon">`. Submit adds/updates method. List shows max 5 cards with icon preview, label, URL, Edit / Delete / ↑ ↓ reorder buttons.

### Admin panel — Tags tab (updated)

Tag form gains `<app-icon-picker formControlName="icon">` below the color picker.

### Home page hero

Replace the "Contact" `<a>` button with:

```html
<div class="contact-icons">
  @for (method of contactMethods(); track method.id) {
    <a [href]="method.url" target="_blank" rel="noopener noreferrer"
       class="contact-icon-btn" [title]="method.label">
      @if (method.iconKey) {
        <img [src]="'/assets/icons/' + method.iconKey + '.svg'" [alt]="method.label">
      } @else if (method.customIconUrl) {
        <img [src]="method.customIconUrl" [alt]="method.label">
      } @else {
        <span>{{ method.label.slice(0, 2) }}</span>
      }
    </a>
  }
</div>
```

CSS: `.contact-icon-btn` — 40×40px circle, accent border, hover scale.

### Tag display (home page)

`tag-badge` and `tag-chip` gain a 16px icon before the name:

```html
@if (tag.iconKey) {
  <img class="tag-icon" [src]="'/assets/icons/' + tag.iconKey + '.svg'" [alt]="">
} @else if (tag.customIconUrl) {
  <img class="tag-icon" [src]="tag.customIconUrl" [alt]="">
}
{{ tag.name }}
```

---

## Error Handling

- POST contact method: 400 `{ error: { code: 'MAX_CONTACT_METHODS', message: 'Maximum 5 contact methods allowed.' } }` when count ≥ 5.
- PUT `/reorder`: 400 if submitted IDs don't match existing IDs.
- Frontend: subscribe error callbacks log and surface a user-visible error signal (same pattern as existing admin forms).

---

## Testing

- `IconPickerComponent` spec: selecting predefined icon sets `iconKey`, clears `customIconUrl`; typing URL sets `customIconUrl`, clears `iconKey`; `writeValue` / `registerOnChange` round-trip.
- `ContactMethodService` spec: each HTTP method calls correct endpoint with correct body.
- Tag service spec: updated `Tag` interface includes icon fields.
