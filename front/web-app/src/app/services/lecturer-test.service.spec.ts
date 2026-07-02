import { TestBed } from '@angular/core/testing';

import { LecturerTestService } from './lecturer-test.service';

describe('LecturerTestService', () => {
  let service: LecturerTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LecturerTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
