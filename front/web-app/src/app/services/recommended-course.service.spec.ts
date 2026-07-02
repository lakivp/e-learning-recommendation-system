import { TestBed } from '@angular/core/testing';

import { RecommendedCourseService } from './recommended-course.service';

describe('RecommendedCourseService', () => {
  let service: RecommendedCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendedCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
