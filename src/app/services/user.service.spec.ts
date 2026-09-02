import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { authInterceptor } from './auth.interceptor';

describe('Capsule authentication API', () => {
  let service: UserService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  for (const action of ['login', 'register'] as const) {
    it(action + ' obtains CSRF protection and receives identity, not credentials', () => {
      let username = '';
      service[action]({ username: 'alice', password: 'test-password' }).subscribe(value => username = value.username);
      http.expectOne('/api/auth/csrf').flush({ token: 'csrf-fixture', headerName: 'X-XSRF-TOKEN' });
      const request = http.expectOne('/api/auth/' + action);
      expect(request.request.method).toBe('POST');
      expect(request.request.withCredentials).toBeTrue();
      expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-fixture');
      expect(request.request.headers.has('Authorization')).toBeFalse();
      request.flush({ username: 'alice' });
      expect(username).toBe('alice');
    });
  }
});
