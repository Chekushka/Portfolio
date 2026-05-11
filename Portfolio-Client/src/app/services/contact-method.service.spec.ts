import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContactMethodService } from './contact-method.service';
import { API_CONFIG } from '../config/api.config';

describe('ContactMethodService', () => {
  let service: ContactMethodService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.contactMethods}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ContactMethodService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMethods calls GET on base URL', () => {
    service.getMethods().subscribe();
    httpMock.expectOne(baseUrl).flush([]);
  });

  it('createMethod calls POST on base URL', () => {
    const req = { label: 'GitHub', iconKey: 'github', customIconUrl: null, url: 'https://github.com', order: 0 };
    service.createMethod(req).subscribe();
    const r = httpMock.expectOne(baseUrl);
    expect(r.request.method).toBe('POST');
    r.flush({});
  });

  it('updateMethod calls PUT on correct URL', () => {
    const req = { label: 'GitHub', iconKey: 'github', customIconUrl: null, url: 'https://github.com', order: 0 };
    service.updateMethod(1, req).subscribe();
    const r = httpMock.expectOne(`${baseUrl}/1`);
    expect(r.request.method).toBe('PUT');
    r.flush({});
  });

  it('deleteMethod calls DELETE on correct URL', () => {
    service.deleteMethod(1).subscribe();
    const r = httpMock.expectOne(`${baseUrl}/1`);
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });

  it('reorder calls PUT on reorder URL', () => {
    service.reorder([2, 1, 3]).subscribe();
    const r = httpMock.expectOne(`${baseUrl}/reorder`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual([2, 1, 3]);
    r.flush(null);
  });
});
