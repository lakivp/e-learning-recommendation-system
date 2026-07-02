import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerLayoutComponent } from './lecturer-layout.component';

describe('LecturerLayoutComponent', () => {
  let component: LecturerLayoutComponent;
  let fixture: ComponentFixture<LecturerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
