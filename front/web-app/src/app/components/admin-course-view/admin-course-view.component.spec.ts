import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCourseViewComponent } from './admin-course-view.component';

describe('AdminCourseViewComponent', () => {
  let component: AdminCourseViewComponent;
  let fixture: ComponentFixture<AdminCourseViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourseViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCourseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
