import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerSidebarComponent } from './lecturer-sidebar.component';

describe('LecturerSidebarComponent', () => {
  let component: LecturerSidebarComponent;
  let fixture: ComponentFixture<LecturerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
