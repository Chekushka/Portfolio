import { Injectable, signal } from '@angular/core';

// UI-only state (which profile theme is active) — not a wrapper around a
// backend controller, so it doesn't follow the 1:1 service-per-controller
// convention used elsewhere in this app.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  activeTheme = signal<string | null>(null);
}
