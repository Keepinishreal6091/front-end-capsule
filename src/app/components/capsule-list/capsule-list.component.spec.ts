import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapsuleListComponent } from './capsule-list.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('CapsuleListComponent', () => {
  let component: CapsuleListComponent;
  let fixture: ComponentFixture<CapsuleListComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapsuleListComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('/api/capsules').flush([]);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allows owner deletion of an unlocked capsule through the API', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.capsules = [{
      id: 1, title: 'Opened', messages: [], locked: false,
      unlockAt: '2020-01-01T00:00:00Z', createdAt: '2019-01-01T00:00:00Z'
    }];
    component.deleteCapsule(1);
    const request = httpTesting.expectOne('/api/capsules/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    expect(component.capsules).toEqual([]);
  });

  it('does not render message content for a locked capsule', () => {
    component.capsules = [{
      id: 1,
      title: 'Private',
      messages: [{ text: 'hidden message', timestamp: '2026-09-02T12:00:00' }],
      unlockAt: '2099-01-01T00:00:00Z',
      createdAt: '2026-09-02T12:00:00',
      locked: true
    }];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('hidden message');
  });
});
