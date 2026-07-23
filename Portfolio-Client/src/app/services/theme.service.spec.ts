import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('starts with no active theme', () => {
    expect(service.activeTheme()).toBeNull();
  });

  it('set() updates the active theme', () => {
    service.activeTheme.set('dotnet');
    expect(service.activeTheme()).toBe('dotnet');
  });

  it('reset to null clears the active theme', () => {
    service.activeTheme.set('unity');
    service.activeTheme.set(null);
    expect(service.activeTheme()).toBeNull();
  });
});
