import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerCourseViewComponent } from './lecturer-course-view.component';

describe('LecturerCourseViewComponent', () => {
  let component: LecturerCourseViewComponent;
  let fixture: ComponentFixture<LecturerCourseViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerCourseViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerCourseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
