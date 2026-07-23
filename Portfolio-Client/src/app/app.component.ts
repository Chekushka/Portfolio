import {Component, HostBinding, inject} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from './services/auth.service';
import {ThemeService} from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public authService = inject(AuthService);
  private themeService = inject(ThemeService);
  title = 'Portfolio';

  @HostBinding('class')
  get themeClass(): string {
    const theme = this.themeService.activeTheme();
    return theme ? `theme-${theme}` : '';
  }

  logout() {
    this.authService.logout();
  }
}
