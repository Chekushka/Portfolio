# Portfolio Client — Angular 21

Single-page application frontend for the portfolio. Public landing page with an interactive mini-game, plus a protected admin panel for managing all content.

## Stack

- **Angular 21** — standalone components, no NgModules
- **TypeScript 5.9**
- **SCSS** — custom design tokens, pixel-art aesthetic
- **Signals** — reactive auth state and data without RxJS subjects
- **ngx-markdown** — project descriptions written in Markdown
- **Vitest** — unit test runner

## Running locally

```bash
cd Portfolio-Client
npm install
ng serve
# App: http://localhost:4200
```

Requires the [API](../Portfolio/README.md) running on port `5177`.

## Build & test

```bash
ng build               # production build → dist/
npx vitest             # unit tests
npx prettier --write src/   # format
```

## App structure

```
src/app/
  components/
    home/          ← public landing page (mini-game, project grid, modal)
    login/         ← login form
    admin/         ← protected content manager
    icon-picker/   ← reusable SVG icon selector (ControlValueAccessor)
    markdown-editor/
  services/        ← auth, project, profile, tag, contact-method
  config/          ← API base URL and endpoint names (api.config.ts)
  pipes/           ← safeUrl (DomSanitizer wrapper for iframe embeds)
```

## Routes

| Path | Access | Component |
|---|---|---|
| `/` | Public | Home (portfolio + mini-game) |
| `/login` | Public | Login form |
| `/admin` | Protected | Content manager |

The `/admin` route is guarded by `auth.guard.ts`. Any 401 response auto-triggers logout and redirect to `/login` via `auth.interceptor.ts`.

## Auth flow

1. `POST /api/auth/login` → receives JWT
2. Token stored in `localStorage`
3. On app init, `AuthService` decodes the `exp` claim — expired tokens are cleared immediately, before any guard or API call
4. `authInterceptor` appends `Authorization: Bearer <token>` to every request
5. 401 response → `AuthService.logout()` + navigate to `/login`

## Icon system

SVG icons live in `src/assets/icons/`. The `icon-picker` component lets admins pick a bundled icon by key or paste a custom URL. Resolution order: `iconKey → /assets/icons/{key}.svg` → `customIconUrl` → fallback text.

## API config

All endpoint URLs are centralized in `src/app/config/api.config.ts`. Change the base URL there when switching environments — no hunting through services.
