# Design Spec: UI & Auth Polish

**Date:** 2026-05-11

---

## Scope

Three independent changes:
1. Browser tab title and favicon
2. JWT expiry reduced to 1h with frontend expiry enforcement
3. Pixelized floating coin (CSS box-shadow technique)

---

## 1. Tab Title & Favicon

### Title
`Portfolio-Client/src/index.html` `<title>` tag changed to `Serhii Chekun | Portfolio`.

### Favicon
- Replace `Portfolio-Client/public/favicon.ico` with `Portfolio-Client/public/favicon.svg`
- SVG: 16×16 pixel-art letter "S", gold/amber fill (`#f5a623`), transparent background
- Pixel grid drawn with SVG `<rect>` elements at 1px scale — no external deps
- `index.html` favicon link: `<link rel="icon" type="image/svg+xml" href="favicon.svg">`
- Keep `favicon.ico` as fallback for legacy browsers: `<link rel="icon" type="image/x-icon" href="favicon.ico">`

---

## 2. Auth Token Expiry

### Backend
`Portfolio/Api/Controllers/AuthController.cs:52` — change `DateTime.Now.AddDays(1)` to `DateTime.Now.AddHours(1)`.

### Frontend

**`auth.service.ts`** — add private `isTokenExpired(token: string): boolean`:
- Decode JWT payload: `JSON.parse(atob(token.split('.')[1]))`
- Compare `payload.exp * 1000` to `Date.now()`
- Returns `true` if expired

On service construction (or `APP_INITIALIZER`), check stored token:
```
const token = localStorage.getItem('token');
if (!token || this.isTokenExpired(token)) {
  localStorage.removeItem('token');
  this.isLoggedIn.set(false);
}
```
This runs on every page load/reconnect — expired token cleared before any route guard or API call.

**`authInterceptor.ts`** — handle mid-session expiry: if HTTP response status is `401`, call `authService.logout()` and redirect to `/login`. Catches token expiry during active session without page reload.

**`auth.service.ts` `logout()`** — already exists; ensure it clears localStorage and sets `isLoggedIn` signal to false. No changes needed if already correct.

### Behavior
| Scenario | Result |
|----------|--------|
| Reconnect after 1h | Token cleared on init, admin panel hidden, guard redirects to `/login` |
| API call with expired token | Backend returns 401, interceptor clears token, redirect to `/login` |
| Token valid | No change |

---

## 3. Pixelized Floating Coin

### Approach
CSS box-shadow pixel grid on a single `<div>`. No HTML changes. The `.bubble-coin` element in `home.component.html` stays as-is.

### Implementation
In `home.component.scss`, replace current `.bubble-coin` styles with:
- Element: `width: 1px; height: 1px; position: relative`
- `box-shadow` list encodes a 16×16 pixel coin shape
- Colors: gold body (`#f5c518`), dark outline (`#8b6914`), highlight pixel (`#fff9c4`)
- `image-rendering: pixelated` on parent to enforce crisp edges
- Scale up via `transform: scale(16)` to reach visible size
- Existing animation/positioning styles preserved

### Coin pixel art
Classic round coin: circular 16×16 outline, solid gold fill, 1–2 highlight pixels top-left, dark border ring. Pixelated aesthetic matches game-theme of mini-game.

---

## Files Changed

| File | Change |
|------|--------|
| `Portfolio-Client/src/index.html` | Title + favicon link tags |
| `Portfolio-Client/public/favicon.svg` | New file — pixel "S" icon |
| `Portfolio/Api/Controllers/AuthController.cs` | Token expiry 24h → 1h |
| `Portfolio-Client/src/app/services/auth.service.ts` | Add `isTokenExpired()`, init check |
| `Portfolio-Client/src/app/auth.interceptor.ts` | Handle 401 → auto-logout |
| `Portfolio-Client/src/app/components/home/home.component.scss` | Pixelized coin CSS |

---

## Out of Scope

- Multi-profile support (future work)
- Refresh token / token renewal
- Per-route expiry granularity
