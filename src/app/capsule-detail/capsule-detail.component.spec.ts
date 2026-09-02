import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CapsuleDetailComponent } from './capsule-detail.component';
import { Capsule } from '../services/capsule.service';

describe('Capsule detail', () => {
  let component: CapsuleDetailComponent;
  let fixture: ComponentFixture<CapsuleDetailComponent>;
  let http: HttpTestingController;
  const capsule: Capsule = {
    id: 1, title: 'Private', messages: [], locked: true,
    createdAt: '2026-09-02T12:00:00Z', unlockAt: '2099-01-01T12:00:00Z'
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleDetailComponent],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CapsuleDetailComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/capsules/1').flush(capsule);
  });
  afterEach(() => http.verify());

  it('uses server locked state even if an unexpected content field is present', () => {
    component.capsule = { ...capsule, messages: [{ text: 'sealed text', timestamp: capsule.createdAt }] };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('sealed text');
    expect(fixture.nativeElement.textContent).toContain('Messages remain sealed');
  });

  it('edits metadata without sending or replacing hidden messages', () => {
    component.editTitle = 'Updated title';
    component.editUnlockLocal = '2099-07-04T14:30';
    component.saveDetails();
    const request = http.expectOne('/api/capsules/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.messages).toBeUndefined();
    expect(request.request.body.unlockAt).toBe(new Date(component.editUnlockLocal).toISOString());
    request.flush({ ...capsule, title: 'Updated title' });
    expect(component.successMessage).toContain('saved');
  });

  it('adds a sealed message and clears the input after success', () => {
    component.newMessage = 'Another memory';
    component.addMessageToCapsule();
    const request = http.expectOne('/api/capsules/1/messages');
    expect(request.request.body).toEqual({ text: 'Another memory' });
    request.flush(capsule);
    expect(component.newMessage).toBe('');
    expect(component.successMessage).toContain('sealed');
  });

  it('preserves timestamp seconds when only the title changes', () => {
    component.capsule = { ...capsule, unlockAt: '2099-01-01T12:00:45Z' };
    component.editTitle = 'Title only';
    component.saveDetails();
    const request = http.expectOne('/api/capsules/1');
    expect(request.request.body.unlockAt).toBe('2099-01-01T12:00:45Z');
    request.flush(capsule);
  });

  it('renders unlocked messages and hides edit controls', () => {
    component.capsule = { ...capsule, locked: false, messages: [{ text: 'Now visible', timestamp: capsule.createdAt }] };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Now visible');
    expect(fixture.nativeElement.querySelector('#editTitle')).toBeNull();
  });
});
