import { TestBed } from '@angular/core/testing';

import { LecturerDashboardService } from './lecturer-dashboard.service';

describe('LecturerDashboardService', () => {
  let service: LecturerDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LecturerDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
