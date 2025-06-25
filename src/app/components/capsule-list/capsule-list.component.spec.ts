import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapsuleListComponent } from './capsule-list.component';

describe('CapsuleListComponent', () => {
  let component: CapsuleListComponent;
  let fixture: ComponentFixture<CapsuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapsuleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapsuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
