import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProjectService } from './project.service';
import { API_CONFIG } from '../config/api.config';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getByProfileId calls GET with profileId query param', () => {
    service.getByProfileId(2).subscribe();
    const r = httpMock.expectOne(`${baseUrl}?profileId=2`);
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });

  it('reorderProject calls PUT on order URL with direction', () => {
    service.reorderProject(5, 'up').subscribe();
    const r = httpMock.expectOne(`${baseUrl}/5/order`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual({ direction: 'up' });
    r.flush([]);
  });
});
