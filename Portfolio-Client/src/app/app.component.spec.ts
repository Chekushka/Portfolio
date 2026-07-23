import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
  });

  it('has no theme class when no profile theme is active', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.className).toBe('');
  });

  it('applies theme-<key> host class once a profile theme is active', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const themeService = TestBed.inject(ThemeService);
    themeService.activeTheme.set('dotnet');
    fixture.detectChanges();
    expect(fixture.nativeElement.className).toBe('theme-dotnet');
  });

  it('clears the host class once the theme resets to null', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const themeService = TestBed.inject(ThemeService);
    themeService.activeTheme.set('unity');
    fixture.detectChanges();
    themeService.activeTheme.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.className).toBe('');
  });
});
