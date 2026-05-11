# Modal Side Layout Mobile Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stack `.modal-layout-side` vertically on mobile (≤560px) so video appears full-width on top and description below.

**Architecture:** Single media query override in the existing `@media (max-width: 560px)` block in `home.component.scss`. No HTML or TS changes needed.

**Tech Stack:** Angular 21, SCSS

---

### Task 1: Add mobile override for `.modal-layout-side`

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.scss`

- [ ] **Step 1: Open the file and locate the `@media (max-width: 560px)` block**

It starts around line 897. Current content ends at `.grid { grid-template-columns: 1fr; }`.

- [ ] **Step 2: Add the override inside the media query block**

Append inside `@media (max-width: 560px) { ... }` after the existing rules:

```scss
.modal-layout-side {
  flex-direction: column;

  .modal-media {
    flex: none;
    width: 100%;
  }

  .modal-desc {
    overflow-y: visible;
  }
}
```

The base `.modal-layout-side .modal-media` rule has `aspect-ratio: 9 / 16` — this is preserved, so portrait video renders full-width at correct ratio.

- [ ] **Step 3: Verify visually — open dev server and check mobile viewport**

```bash
cd Portfolio-Client && ng serve
```

Open `http://localhost:4200`, open DevTools → toggle device toolbar → pick a 375px-wide device. Click any project card that has a video with `videoLayout === 'side'`. Confirm: video stacks on top full-width, description flows below, no side-by-side cramping.

- [ ] **Step 4: Verify desktop layout unchanged**

Switch DevTools to desktop (1280px+). Reopen same project modal. Confirm: video still appears on the left (35% width, 9:16), description on the right.

- [ ] **Step 5: Commit**

```bash
git add Portfolio-Client/src/app/components/home/home.component.scss
git commit -m "fix(modal): stack side layout vertically on mobile"
```
