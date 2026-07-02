import { TestBed } from '@angular/core/testing';

import { AdminActivityService } from './admin-activity.service';

describe('AdminActivityService', () => {
  let service: AdminActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
