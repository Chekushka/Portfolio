import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TagService } from './tag.service';
import { API_CONFIG } from '../config/api.config';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.tags}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getTags sends GET and returns tag array', () => {
    const mock = [{ id: 1, name: 'Unity', color: '#3b82f6' }];
    service.getTags().subscribe(tags => expect(tags).toEqual(mock));
    httpMock.expectOne(baseUrl).flush(mock);
  });

  it('createTag sends POST and returns created tag', () => {
    const payload = { name: 'Unity', color: '#3b82f6', iconKey: null, customIconUrl: null };
    service.createTag(payload).subscribe(tag => expect(tag.id).toBe(1));
    const req = httpMock.expectOne({ method: 'POST', url: baseUrl });
    req.flush({ id: 1, ...payload });
  });

  it('updateTag sends PUT to /Tags/:id', () => {
    service.updateTag(1, { name: 'Updated', color: '#ff0000', iconKey: null, customIconUrl: null }).subscribe();
    httpMock.expectOne({ method: 'PUT', url: `${baseUrl}/1` }).flush(null);
  });

  it('deleteTag sends DELETE to /Tags/:id', () => {
    service.deleteTag(1).subscribe();
    httpMock.expectOne({ method: 'DELETE', url: `${baseUrl}/1` }).flush(null);
  });
});
