# Design Spec: Modal Video Layout & Tag Contrast

**Date:** 2026-05-11

---

## Scope

Two targeted CSS-only changes to the project modal in `home.component.scss`:
1. Side layout (`videoLayout === 'side'`) — portrait 9:16 video + uncapped description height
2. Tag text contrast — `.mtag` text and border readability

---

## 1. Side Layout: Portrait Video + Taller Description

### Current state (`home.component.scss:942–950`)

```scss
.modal-layout-side {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: flex-start;

  .modal-media { flex: 0 0 50%; }
  .modal-desc { flex: 1; overflow-y: auto; max-height: 400px; }
}
```

- Video: 50% wide, inherits global `aspect-ratio: 16/9` from `.modal-media` (line 757)
- Description: capped at 400px height, scrolls beyond that

### Changes

**`.modal-layout-side`**
- `align-items: flex-start` → `align-items: stretch` so both columns fill full height of the layout row

**`.modal-media` inside side layout**
- `flex: 0 0 50%` → `flex: 0 0 35%` — portrait video needs less horizontal space
- Override `aspect-ratio` to `9 / 16` — portrait phone format

**`.modal-desc` inside side layout**
- Remove `max-height: 400px` — description now naturally matches the portrait video height
- Keep `flex: 1; overflow-y: auto`

### Result

Portrait video (~35% width) left column, description filling remaining 65% height-matched to the taller video. No height cap on description.

---

## 2. Tag Text Contrast

### Current state (`home.component.scss:788–803`)

```scss
.mtag {
  ...
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  color: var(--c-muted);  // ← low contrast
  ...
}
```

Tags get `background-color` overridden dynamically via `[style.background-color]="tag.color"` in the template. Admin-set colors are typically medium-to-bright hues. `var(--c-muted)` is a light/dim color that becomes unreadable against light tag backgrounds.

### Changes

- `color: var(--c-muted)` → `color: oklch(15% 0.04 265)` — near-black, readable on all medium/bright backgrounds
- `border: 2px solid var(--c-border)` → `border: 2px solid var(--c-border-strong)` — stronger definition against tag colors

`.mtag.green` already has explicit dark green `color: oklch(38% 0.18 145)` — leave unchanged.

---

## Files Changed

| File | Change |
|------|--------|
| `Portfolio-Client/src/app/components/home/home.component.scss` | `.modal-layout-side` overrides + `.mtag` color/border |

---

## Out of Scope

- `above` layout — unchanged
- Phone bezel/frame visual — not requested
- CSS `color-contrast()` dynamic contrast — deferred until browser support is universal
