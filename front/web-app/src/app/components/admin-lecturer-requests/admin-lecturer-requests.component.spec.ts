import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLecturerRequestsComponent } from './admin-lecturer-requests.component';

describe('AdminLecturerRequestsComponent', () => {
  let component: AdminLecturerRequestsComponent;
  let fixture: ComponentFixture<AdminLecturerRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLecturerRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLecturerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
