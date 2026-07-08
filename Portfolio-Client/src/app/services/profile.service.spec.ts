import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';
import { API_CONFIG } from '../config/api.config';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.profile}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getBySlug calls GET on correct URL', () => {
    service.getBySlug('dotnet').subscribe();
    const r = httpMock.expectOne(`${baseUrl}/dotnet`);
    expect(r.request.method).toBe('GET');
    r.flush({});
  });

  it('updateBySlug calls PUT on correct URL', () => {
    const data = { name: 'Test', role: '.NET Dev', bio: '', photoUrl: '', cvUrl: '', email: '' };
    service.updateBySlug('dotnet', data as any).subscribe();
    const r = httpMock.expectOne(`${baseUrl}/dotnet`);
    expect(r.request.method).toBe('PUT');
    r.flush(null);
  });
});
