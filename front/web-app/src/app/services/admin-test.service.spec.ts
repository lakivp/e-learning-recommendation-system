import { TestBed } from '@angular/core/testing';

import { AdminTestService } from './admin-test.service';

describe('AdminTestService', () => {
  let service: AdminTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
