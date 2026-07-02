import { TestBed } from '@angular/core/testing';

import { LecturerCourseService } from './lecturer-course.service';

describe('LecturerCourseService', () => {
  let service: LecturerCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LecturerCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
