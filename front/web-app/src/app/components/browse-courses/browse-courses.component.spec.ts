import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseCoursesComponent } from './browse-courses.component';

describe('BrowseCoursesComponent', () => {
  let component: BrowseCoursesComponent;
  let fixture: ComponentFixture<BrowseCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
