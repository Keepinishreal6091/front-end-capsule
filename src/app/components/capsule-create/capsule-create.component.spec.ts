import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapsuleCreateComponent } from './capsule-create.component';

describe('CapsuleCreateComponent', () => {
  let component: CapsuleCreateComponent;
  let fixture: ComponentFixture<CapsuleCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapsuleCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
