import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

function makeJwt(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp: expSeconds }));
  return `${header}.${payload}.sig`;
}

describe('AuthService', () => {
  function createService(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('isLoggedIn false when no token', () => {
    const service = createService();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn false and token removed when stored token is expired', () => {
    localStorage.setItem('token', makeJwt(Math.floor(Date.now() / 1000) - 10));
    const service = createService();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('isLoggedIn true when stored token is valid', () => {
    localStorage.setItem('token', makeJwt(Math.floor(Date.now() / 1000) + 3600));
    const service = createService();
    expect(service.isLoggedIn()).toBe(true);
  });
});
