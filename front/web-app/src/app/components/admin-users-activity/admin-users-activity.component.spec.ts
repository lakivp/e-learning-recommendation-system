import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersActivityComponent } from './admin-users-activity.component';

describe('AdminUsersActivityComponent', () => {
  let component: AdminUsersActivityComponent;
  let fixture: ComponentFixture<AdminUsersActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsersActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
