import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  readonly year = new Date().getFullYear();

  private main = viewChild.required<ElementRef<HTMLElement>>('main');

  logout() {
    this.authService.logout();
  }

  // NOTE: a plain href="#main" would resolve against <base href="/"> and navigate to the
  // chooser, so focus is moved manually.
  skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
