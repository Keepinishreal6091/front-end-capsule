import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CapsuleService } from './capsule.service';
import { authInterceptor } from './auth.interceptor';
import { CsrfService } from './csrf.service';

describe('Capsule API', () => {
  let service: CapsuleService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
    });
    service = TestBed.inject(CapsuleService);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(CsrfService).ensureToken().subscribe();
    http.expectOne('/api/auth/csrf').flush({ token: 'csrf-fixture', headerName: 'X-XSRF-TOKEN' });
  });
  afterEach(() => http.verify());

  it('uses cookies, not bearer headers, for listing', () => {
    service.getAllCapsules().subscribe();
    const request = http.expectOne('/api/capsules');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush([]);
  });

  it('sends a CSRF-protected PATCH message', () => {
    service.addMessage(7, 'future message').subscribe();
    const request = http.expectOne('/api/capsules/7/messages');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ text: 'future message' });
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-fixture');
    request.flush({});
  });

  it('updates metadata without erasing sealed messages', () => {
    service.updateCapsule(7, { title: 'Updated', unlockAt: '2099-01-01T12:00:00Z' }).subscribe();
    const request = http.expectOne('/api/capsules/7');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.messages).toBeUndefined();
    request.flush({});
  });

  it('sends owner deletion through the protected API', () => {
    service.deleteCapsule(7).subscribe();
    const request = http.expectOne('/api/capsules/7');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-fixture');
    request.flush(null);
  });
});
