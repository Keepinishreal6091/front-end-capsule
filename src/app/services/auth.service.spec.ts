import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { CsrfService } from './csrf.service';

describe('Capsule cookie sessions', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });
  afterEach(() => http.verify());

  function csrf(): void {
    const request = http.expectOne('/api/auth/csrf');
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ headerName: 'X-XSRF-TOKEN', token: 'csrf-fixture' });
  }

  it('restores the username from the cookie session without storing credentials', () => {
    const storage = spyOn(Storage.prototype, 'setItem');
    const removal = spyOn(Storage.prototype, 'removeItem');
    auth.initialize().subscribe();
    csrf();
    http.expectOne('/api/auth/session').flush({ username: 'alice' });
    expect(auth.isLoggedIn()).toBeTrue();
    expect(auth.getUsername()).toBe('alice');
    expect(storage).not.toHaveBeenCalled();
    expect(removal).toHaveBeenCalledWith('capsule_access_token');
    expect(removal).toHaveBeenCalledWith('username');
  });

  it('attempts refresh after an expired access session and remains usable when logged out', () => {
    let completed = false;
    auth.initialize().subscribe(() => completed = true);
    csrf();
    http.expectOne('/api/auth/session').flush({}, { status: 401, statusText: 'Unauthorized' });
    const refresh = http.expectOne('/api/auth/refresh');
    expect(refresh.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-fixture');
    refresh.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(completed).toBeTrue();
    expect(auth.isLoggedIn()).toBeFalse();
  });

  it('refreshes once for concurrent 401s and retries the original requests', () => {
    TestBed.inject(CsrfService).ensureToken().subscribe();
    csrf();
    let received = 0;
    client.get('/api/capsules').subscribe(() => received++);
    client.get('/api/capsules/1').subscribe(() => received++);
    http.expectOne('/api/capsules').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/capsules/1').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({ username: 'alice' });
    http.expectOne('/api/capsules').flush([]);
    http.expectOne('/api/capsules/1').flush({});
    expect(received).toBe(2);
  });

  it('does not retry indefinitely when the retried request is unauthorized', () => {
    TestBed.inject(CsrfService).ensureToken().subscribe();
    csrf();
    let failed = false;
    client.get('/api/capsules').subscribe({ error: () => failed = true });
    http.expectOne('/api/capsules').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({ username: 'alice' });
    http.expectOne('/api/capsules').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectNone('/api/auth/refresh');
    expect(failed).toBeTrue();
  });

  it('logs out on the server and clears only in-memory identity after success', () => {
    auth.acceptSession({ username: 'alice' });
    auth.logout().subscribe();
    csrf();
    const request = http.expectOne('/api/auth/logout');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-fixture');
    request.flush(null);
    expect(auth.isLoggedIn()).toBeFalse();
  });

  it('does not claim logout succeeded when the server is unreachable', () => {
    auth.acceptSession({ username: 'alice' });
    auth.logout().subscribe({ error: () => undefined });
    csrf();
    http.expectOne('/api/auth/logout').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(auth.isLoggedIn()).toBeTrue();
  });

  it('does not attach credentials or CSRF data to unrelated URLs', () => {
    client.post('https://example.test/other', {}).subscribe();
    const request = http.expectOne('https://example.test/other');
    expect(request.request.withCredentials).toBeFalse();
    expect(request.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    request.flush({});
  });
});
