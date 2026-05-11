# Modal Video Layout & Tag Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix side-layout modal video to portrait 9:16 aspect ratio with uncapped description height, and increase tag text contrast in the modal.

**Architecture:** CSS-only changes in a single SCSS file. No TypeScript or HTML changes needed. Both tasks are independent edits to existing rule blocks.

**Tech Stack:** Angular 21, SCSS

---

## File Map

| File | Change |
|------|--------|
| `Portfolio-Client/src/app/components/home/home.component.scss:942–950` | `.modal-layout-side` overrides — portrait aspect, remove max-height |
| `Portfolio-Client/src/app/components/home/home.component.scss:788–803` | `.mtag` — near-black text, stronger border |

---

## Task 1: Side Layout — Portrait Video + Uncapped Description

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.scss:942–950`

Current block at line 942:
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

- [ ] **Step 1: Apply the change**

Replace the entire `.modal-layout-side` block with:

```scss
.modal-layout-side {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: stretch;

  .modal-media { flex: 0 0 35%; aspect-ratio: 9 / 16; }
  .modal-desc { flex: 1; overflow-y: auto; }
}
```

Three diffs:
- `align-items: flex-start` → `align-items: stretch`
- `.modal-media`: `flex: 0 0 50%` → `flex: 0 0 35%; aspect-ratio: 9 / 16`
- `.modal-desc`: removed `max-height: 400px`

- [ ] **Step 2: Verify visually**

Start dev server from `Portfolio-Client/`:
```bash
ng serve
```

Open `http://localhost:4200`, open a project that has `videoLayout === 'side'` set. Verify:
- Video renders in portrait orientation (taller than wide)
- Video occupies roughly 35% of modal width
- Description fills remaining width and is not height-capped
- Both columns stretch to same height

- [ ] **Step 3: Commit**

```bash
git add Portfolio-Client/src/app/components/home/home.component.scss
git commit -m "fix(modal): portrait 9:16 video in side layout, remove description height cap"
```

---

## Task 2: Tag Text Contrast

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.scss:788–803`

Current block at line 788:
```scss
.mtag {
  padding: 4px 12px;
  border-radius: 2px;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  color: var(--c-muted);

  &.green {
    background: oklch(93% 0.07 145);
    border-color: oklch(80% 0.14 145);
    color: oklch(38% 0.18 145);
  }
}
```

- [ ] **Step 1: Apply the change**

Replace only the `color` and `border` lines inside `.mtag` (leave `.mtag.green` untouched):

```scss
.mtag {
  padding: 4px 12px;
  border-radius: 2px;
  font-family: var(--font-display);
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--c-surface);
  border: 2px solid var(--c-border-strong);
  color: oklch(15% 0.04 265);

  &.green {
    background: oklch(93% 0.07 145);
    border-color: oklch(80% 0.14 145);
    color: oklch(38% 0.18 145);
  }
}
```

Two diffs:
- `border: 2px solid var(--c-border)` → `border: 2px solid var(--c-border-strong)`
- `color: var(--c-muted)` → `color: oklch(15% 0.04 265)`

- [ ] **Step 2: Verify visually**

Open `http://localhost:4200`, open any project modal that has tags. Verify:
- Tag text is clearly readable (near-black) against the tag background color
- `.mtag.green` (downloads badge) still uses its own green text — not affected
- Tag border is visibly defined

- [ ] **Step 3: Commit**

```bash
git add Portfolio-Client/src/app/components/home/home.component.scss
git commit -m "fix(modal): increase tag text contrast to near-black, strengthen border"
```
