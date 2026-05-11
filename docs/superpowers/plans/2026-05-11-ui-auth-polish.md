# UI & Auth Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change browser tab title/favicon, enforce 1-hour JWT expiry on both backend and frontend, and replace floating coin with CSS pixel-art version.

**Architecture:** Six independent changes across three layers — `index.html` meta, backend JWT config, Angular auth service + interceptor, and SCSS component. Each task is self-contained and can be verified in isolation.

**Tech Stack:** ASP.NET Core 8, Angular 21 (standalone), SCSS, Vitest

---

## File Map

| File | Change |
|------|--------|
| `Portfolio-Client/src/index.html` | Title + favicon link tags |
| `Portfolio-Client/public/favicon.svg` | New — pixel-art "S" icon |
| `Portfolio/Api/Controllers/AuthController.cs` | Token expiry 24h → 1h |
| `Portfolio-Client/src/app/services/auth.service.ts` | Add `hasValidToken()`, `isTokenExpired()` |
| `Portfolio-Client/src/app/auth.interceptor.ts` | Handle 401 → auto-logout + redirect |
| `Portfolio-Client/src/app/components/home/home.component.scss` | Replace `.coin-face` with pixel-art box-shadow coin |

---

## Task 1: Tab Title

**Files:**
- Modify: `Portfolio-Client/src/index.html:5`

- [ ] **Step 1: Update title tag**

In `Portfolio-Client/src/index.html`, replace line 5:
```html
<title>Serhii Chekun | Portfolio</title>
```

- [ ] **Step 2: Verify**

Run `ng serve`, open `http://localhost:4200`, check browser tab reads `Serhii Chekun | Portfolio`.

- [ ] **Step 3: Commit**
```bash
git add Portfolio-Client/src/index.html
git commit -m "feat(meta): set browser tab title to 'Serhii Chekun | Portfolio'"
```

---

## Task 2: Pixel-Art "S" Favicon

**Files:**
- Create: `Portfolio-Client/public/favicon.svg`
- Modify: `Portfolio-Client/src/index.html:8`

- [ ] **Step 1: Create favicon SVG**

Create `Portfolio-Client/public/favicon.svg` with this content — a 16×16 pixel-art "S" (gold `#f5c518` on dark navy `#1a1a2e`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <rect width="16" height="16" fill="#1a1a2e"/>
  <!-- top bar -->
  <rect x="3" y="1" width="2" height="2" fill="#f5c518"/>
  <rect x="5" y="1" width="2" height="2" fill="#f5c518"/>
  <rect x="7" y="1" width="2" height="2" fill="#f5c518"/>
  <rect x="9" y="1" width="2" height="2" fill="#f5c518"/>
  <rect x="11" y="1" width="2" height="2" fill="#f5c518"/>
  <!-- upper sides -->
  <rect x="1" y="3" width="2" height="2" fill="#f5c518"/>
  <rect x="13" y="3" width="2" height="2" fill="#f5c518"/>
  <!-- upper left arm -->
  <rect x="1" y="5" width="2" height="2" fill="#f5c518"/>
  <!-- middle bar -->
  <rect x="3" y="7" width="2" height="2" fill="#f5c518"/>
  <rect x="5" y="7" width="2" height="2" fill="#f5c518"/>
  <rect x="7" y="7" width="2" height="2" fill="#f5c518"/>
  <rect x="9" y="7" width="2" height="2" fill="#f5c518"/>
  <rect x="11" y="7" width="2" height="2" fill="#f5c518"/>
  <!-- lower right arm -->
  <rect x="13" y="9" width="2" height="2" fill="#f5c518"/>
  <!-- lower sides -->
  <rect x="1" y="11" width="2" height="2" fill="#f5c518"/>
  <rect x="13" y="11" width="2" height="2" fill="#f5c518"/>
  <!-- bottom bar -->
  <rect x="3" y="13" width="2" height="2" fill="#f5c518"/>
  <rect x="5" y="13" width="2" height="2" fill="#f5c518"/>
  <rect x="7" y="13" width="2" height="2" fill="#f5c518"/>
  <rect x="9" y="13" width="2" height="2" fill="#f5c518"/>
  <rect x="11" y="13" width="2" height="2" fill="#f5c518"/>
</svg>
```

- [ ] **Step 2: Update index.html favicon links**

Replace line 8 in `Portfolio-Client/src/index.html`:
```html
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
```

SVG is preferred by modern browsers; `.ico` is fallback for legacy.

- [ ] **Step 3: Verify**

Run `ng serve`, open `http://localhost:4200`, check browser tab shows gold "S" icon.

- [ ] **Step 4: Commit**
```bash
git add Portfolio-Client/public/favicon.svg Portfolio-Client/src/index.html
git commit -m "feat(meta): add pixel-art 'S' favicon"
```

---

## Task 3: JWT Expiry — Backend 1 Hour

**Files:**
- Modify: `Portfolio/Api/Controllers/AuthController.cs:52`

- [ ] **Step 1: Change expiry**

In `Portfolio/Api/Controllers/AuthController.cs`, find the line:
```csharp
expires: DateTime.Now.AddDays(1),
```
Change to:
```csharp
expires: DateTime.Now.AddHours(1),
```

- [ ] **Step 2: Build and verify**
```bash
cd Portfolio && dotnet build
```
Expected: `Build succeeded` with 0 errors.

- [ ] **Step 3: Commit**
```bash
git add Portfolio/Api/Controllers/AuthController.cs
git commit -m "feat(auth): reduce JWT expiry from 24h to 1h"
```

---

## Task 4: Frontend Token Expiry Check on Init

**Files:**
- Modify: `Portfolio-Client/src/app/services/auth.service.ts`

- [ ] **Step 1: Write failing test**

Create/open `Portfolio-Client/src/app/services/auth.service.spec.ts` and add:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

function makeJwt(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `${header}.${payload}.sig`;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('isLoggedIn false when no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn false and token removed when stored token is expired', () => {
    const expiredToken = makeJwt(Math.floor(Date.now() / 1000) - 10);
    localStorage.setItem('token', expiredToken);
    // Re-create service so constructor runs with stored token
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('isLoggedIn true when stored token is valid', () => {
    const validToken = makeJwt(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('token', validToken);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
cd Portfolio-Client && npx vitest run src/app/services/auth.service.spec.ts
```
Expected: FAIL — `hasValidToken is not a function` or similar.

- [ ] **Step 3: Update AuthService**

Replace full content of `Portfolio-Client/src/app/services/auth.service.ts`:

```typescript
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.auth}`;
  isLoggedIn = signal<boolean>(this.hasValidToken());

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**
```bash
npx vitest run src/app/services/auth.service.spec.ts
```
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**
```bash
git add Portfolio-Client/src/app/services/auth.service.ts Portfolio-Client/src/app/services/auth.service.spec.ts
git commit -m "feat(auth): clear expired JWT on app init, add isTokenExpired check"
```

---

## Task 5: 401 Auto-Logout in HTTP Interceptor

**Files:**
- Modify: `Portfolio-Client/src/app/auth.interceptor.ts`

- [ ] **Step 1: Write failing test**

Create `Portfolio-Client/src/app/auth.interceptor.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('calls logout and navigates to /login on 401', () => {
    localStorage.setItem('token', 'fake-token');
    authService.isLoggedIn.set(true);

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('attaches Authorization header when token exists', () => {
    localStorage.setItem('token', 'my-token');

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npx vitest run src/app/auth.interceptor.spec.ts
```
Expected: FAIL — 401 test fails because interceptor doesn't call logout.

- [ ] **Step 3: Update interceptor**

Replace full content of `Portfolio-Client/src/app/auth.interceptor.ts`:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    tap({
      error: (err) => {
        if (err.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
      },
    })
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**
```bash
npx vitest run src/app/auth.interceptor.spec.ts
```
Expected: both tests PASS.

- [ ] **Step 5: Manual verification**

Start backend (`dotnet run` in `Portfolio/`) and frontend (`ng serve` in `Portfolio-Client/`). Log in at `http://localhost:4200/login`. Open DevTools → Application → Local Storage, manually edit the token's `exp` field to a past timestamp, then navigate to `/admin`. Should redirect to `/login`.

- [ ] **Step 6: Commit**
```bash
git add Portfolio-Client/src/app/auth.interceptor.ts Portfolio-Client/src/app/auth.interceptor.spec.ts
git commit -m "feat(auth): auto-logout and redirect to /login on 401 response"
```

---

## Task 6: Pixelized Floating Coin

**Files:**
- Modify: `Portfolio-Client/src/app/components/home/home.component.scss`

The current `.coin-face` is a round gradient div (52×52px, `border-radius: 50%`) with `coinSpin` (`rotateY`) animation. We replace its visual with a CSS box-shadow pixel grid on a `::before` pseudo-element. The `.coin-label` stays centered inside `.coin-face`. All positioning, animation, and interaction styles on `.bubble-coin` are preserved.

- [ ] **Step 1: Replace `.coin-face` and `.coin-label` styles**

In `Portfolio-Client/src/app/components/home/home.component.scss`, find the block starting at `// ── Bubble Coins` (line ~175). Replace the `.coin-face` and `.coin-label` rules (keep `.bubble-coin` and `@keyframes bubbleRise`/`coinSpin` untouched):

**Remove this block** (`.coin-face` styles, lines ~202–224):
```scss
.coin-face {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 36% 34%,
    oklch(92% 0.12 85),
    oklch(70% 0.22 75) 42%,
    oklch(58% 0.22 68) 78%,
    oklch(42% 0.2 60)
  );
  border: 2px solid oklch(65% 0.2 75);
  box-shadow:
    0 3px 10px oklch(70% 0.22 75 / 0.3),
    0 1px 3px oklch(22% 0.018 265 / 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: coinSpin 2s linear infinite;
  transition:
    box-shadow 0.15s,
    transform 0.15s;
}

.coin-label {
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  color: oklch(34% 0.18 60);
  pointer-events: none;
}
```

**Replace with:**
```scss
.coin-face {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: coinSpin 2s linear infinite;
  transition: transform 0.15s;
  image-rendering: pixelated;

  // 12×12 pixel-art coin using box-shadow grid (4px per pixel, offset 2px inset)
  // Grid origin: top=2px, left=2px. Coin fits 50×50px within 52px container.
  // Colors: #f5c518 gold, #fef08a highlight (top-left)
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 4px;
    height: 4px;
    box-shadow:
      /* row 0 — cols 4-7 */
      18px 0    0 0 #f5c518,
      22px 0    0 0 #f5c518,
      26px 0    0 0 #f5c518,
      30px 0    0 0 #f5c518,
      /* row 1 — cols 2-3 highlight, 4-9 gold */
      10px 4px  0 0 #fef08a,
      14px 4px  0 0 #fef08a,
      18px 4px  0 0 #f5c518,
      22px 4px  0 0 #f5c518,
      26px 4px  0 0 #f5c518,
      30px 4px  0 0 #f5c518,
      34px 4px  0 0 #f5c518,
      38px 4px  0 0 #f5c518,
      /* row 2 — cols 1-2 highlight, 3-10 gold */
      6px  8px  0 0 #fef08a,
      10px 8px  0 0 #fef08a,
      14px 8px  0 0 #f5c518,
      18px 8px  0 0 #f5c518,
      22px 8px  0 0 #f5c518,
      26px 8px  0 0 #f5c518,
      30px 8px  0 0 #f5c518,
      34px 8px  0 0 #f5c518,
      38px 8px  0 0 #f5c518,
      42px 8px  0 0 #f5c518,
      /* row 3 — cols 0-1 highlight, 2-11 gold */
      2px  12px 0 0 #fef08a,
      6px  12px 0 0 #fef08a,
      10px 12px 0 0 #f5c518,
      14px 12px 0 0 #f5c518,
      18px 12px 0 0 #f5c518,
      22px 12px 0 0 #f5c518,
      26px 12px 0 0 #f5c518,
      30px 12px 0 0 #f5c518,
      34px 12px 0 0 #f5c518,
      38px 12px 0 0 #f5c518,
      42px 12px 0 0 #f5c518,
      46px 12px 0 0 #f5c518,
      /* row 4 — col 0 highlight, cols 1-11 gold */
      2px  16px 0 0 #fef08a,
      6px  16px 0 0 #f5c518,
      10px 16px 0 0 #f5c518,
      14px 16px 0 0 #f5c518,
      18px 16px 0 0 #f5c518,
      22px 16px 0 0 #f5c518,
      26px 16px 0 0 #f5c518,
      30px 16px 0 0 #f5c518,
      34px 16px 0 0 #f5c518,
      38px 16px 0 0 #f5c518,
      42px 16px 0 0 #f5c518,
      46px 16px 0 0 #f5c518,
      /* rows 5-8 — cols 0-11 all gold */
      2px  20px 0 0 #f5c518, 6px  20px 0 0 #f5c518, 10px 20px 0 0 #f5c518, 14px 20px 0 0 #f5c518,
      18px 20px 0 0 #f5c518, 22px 20px 0 0 #f5c518, 26px 20px 0 0 #f5c518, 30px 20px 0 0 #f5c518,
      34px 20px 0 0 #f5c518, 38px 20px 0 0 #f5c518, 42px 20px 0 0 #f5c518, 46px 20px 0 0 #f5c518,
      2px  24px 0 0 #f5c518, 6px  24px 0 0 #f5c518, 10px 24px 0 0 #f5c518, 14px 24px 0 0 #f5c518,
      18px 24px 0 0 #f5c518, 22px 24px 0 0 #f5c518, 26px 24px 0 0 #f5c518, 30px 24px 0 0 #f5c518,
      34px 24px 0 0 #f5c518, 38px 24px 0 0 #f5c518, 42px 24px 0 0 #f5c518, 46px 24px 0 0 #f5c518,
      2px  28px 0 0 #f5c518, 6px  28px 0 0 #f5c518, 10px 28px 0 0 #f5c518, 14px 28px 0 0 #f5c518,
      18px 28px 0 0 #f5c518, 22px 28px 0 0 #f5c518, 26px 28px 0 0 #f5c518, 30px 28px 0 0 #f5c518,
      34px 28px 0 0 #f5c518, 38px 28px 0 0 #f5c518, 42px 28px 0 0 #f5c518, 46px 28px 0 0 #f5c518,
      2px  32px 0 0 #f5c518, 6px  32px 0 0 #f5c518, 10px 32px 0 0 #f5c518, 14px 32px 0 0 #f5c518,
      18px 32px 0 0 #f5c518, 22px 32px 0 0 #f5c518, 26px 32px 0 0 #f5c518, 30px 32px 0 0 #f5c518,
      34px 32px 0 0 #f5c518, 38px 32px 0 0 #f5c518, 42px 32px 0 0 #f5c518, 46px 32px 0 0 #f5c518,
      /* row 9 — cols 1-10 gold */
      6px  36px 0 0 #f5c518, 10px 36px 0 0 #f5c518, 14px 36px 0 0 #f5c518, 18px 36px 0 0 #f5c518,
      22px 36px 0 0 #f5c518, 26px 36px 0 0 #f5c518, 30px 36px 0 0 #f5c518, 34px 36px 0 0 #f5c518,
      38px 36px 0 0 #f5c518, 42px 36px 0 0 #f5c518,
      /* row 10 — cols 2-9 gold */
      10px 40px 0 0 #f5c518, 14px 40px 0 0 #f5c518, 18px 40px 0 0 #f5c518, 22px 40px 0 0 #f5c518,
      26px 40px 0 0 #f5c518, 30px 40px 0 0 #f5c518, 34px 40px 0 0 #f5c518, 38px 40px 0 0 #f5c518,
      /* row 11 — cols 4-7 gold */
      18px 44px 0 0 #f5c518,
      22px 44px 0 0 #f5c518,
      26px 44px 0 0 #f5c518,
      30px 44px 0 0 #f5c518;
  }
}

.coin-label {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  color: oklch(34% 0.18 60);
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(255 255 255 / 0.6);
}
```

Also update the hover style on `.bubble-coin` to remove the `box-shadow` reference (it no longer applies to `.coin-face`). Find in `.bubble-coin`:
```scss
  &:hover .coin-face {
    box-shadow: 0 6px 16px oklch(70% 0.22 75 / 0.45);
    transform: scale(1.1);
  }
```
Replace with:
```scss
  &:hover .coin-face {
    filter: brightness(1.2);
    transform: scale(1.1);
  }
```

- [ ] **Step 2: Verify visually**

Run `ng serve`, open `http://localhost:4200`, wait for a coin to spawn (up to 15s), verify:
- Coin is square/pixelated gold shape, no circle gradient
- Coin rises and spins (rotateY)
- Hover brightens and scales up
- `+1`, `+3`, `+5` label visible on coin

- [ ] **Step 3: Commit**
```bash
git add Portfolio-Client/src/app/components/home/home.component.scss
git commit -m "feat(home): replace coin with CSS pixel-art box-shadow design"
```
