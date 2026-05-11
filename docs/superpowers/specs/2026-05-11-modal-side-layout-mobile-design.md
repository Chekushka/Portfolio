# Modal Side Layout — Mobile Responsive Fix

## Problem

`.modal-layout-side` uses `flex-direction: row` with no mobile override. On narrow screens the portrait video (35% width, 9:16) and description sit side-by-side, producing a cramped, unusable layout.

## Solution

At the existing `≤560px` breakpoint, override `.modal-layout-side` to stack vertically: video full-width on top, description below. No HTML or TS changes.

## Changes

**File:** `Portfolio-Client/src/app/components/home/home.component.scss`

Inside `@media (max-width: 560px)`, add:

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

The 9:16 aspect ratio from the base rule is preserved — portrait video displays full-width and full-height.

## Non-goals

- No change to desktop layout.
- No change to `modal-layout-above`.
- No breakpoint adjustments above 560px.
