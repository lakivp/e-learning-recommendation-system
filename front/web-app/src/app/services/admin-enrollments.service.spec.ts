import { TestBed } from '@angular/core/testing';

import { AdminEnrollmentsService } from './admin-enrollments.service';

describe('AdminEnrollmentsService', () => {
  let service: AdminEnrollmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminEnrollmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
