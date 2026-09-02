import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CapsuleCreateComponent } from './capsule-create.component';

describe('Capsule creation', () => {
  let component: CapsuleCreateComponent;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleCreateComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    component = TestBed.createComponent(CapsuleCreateComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
    component.title = 'Future self';
    component.messageInput = 'Remember this';
  });
  afterEach(() => http.verify());

  it('converts client local time to UTC before creating a capsule', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    component.unlockLocal = '2099-07-04T14:30';
    component.saveCapsule();
    const request = http.expectOne('/api/capsules');
    expect(request.request.body.unlockAt).toBe(new Date(component.unlockLocal).toISOString());
    request.flush({});
    expect(navigate).toHaveBeenCalledWith(['/my-capsules']);
  });

  it('rejects a past unlock instant without an API request', () => {
    component.unlockLocal = '2000-01-01T00:00';
    component.saveCapsule();
    http.expectNone('/api/capsules');
    expect(component.errorMessage).toContain('future');
  });

  it('shows an actionable error if creation fails', () => {
    component.unlockLocal = '2099-07-04T14:30';
    component.saveCapsule();
    http.expectOne('/api/capsules').flush({}, { status: 500, statusText: 'Error' });
    expect(component.submitting).toBeFalse();
    expect(component.errorMessage).toContain('try again');
  });
});
