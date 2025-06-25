import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapsuleDetailComponent } from './capsule-detail.component';

describe('CapsuleDetailComponent', () => {
  let component: CapsuleDetailComponent;
  let fixture: ComponentFixture<CapsuleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapsuleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
