import { Component, OnInit } from '@angular/core';
import { UserCourseService, MyCourse } from '../../services/user-course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.css'
})
export class MyCoursesComponent implements OnInit {

  activeCourses: MyCourse[] = [];
  completedCourses: MyCourse[] = [];

  searchText = '';

  filteredActiveCourses :MyCourse[] = [];
  filteredCompletedCourses: MyCourse[] = [];

  descModalOpen = false;
  selectedCourse: any = null;

  activePage = 1;
  activePageSize = 8;

  completedPage = 1;
  completedPageSize = 8;
  maxVisiblePages = 4;
  
  courseFilter : 'all' | 'active' | 'completed' = 'all';

  constructor(private service: UserCourseService) {}

  ngOnInit(): void {
    this.service.getMyCourses().subscribe(res => {
      this.activeCourses = res.filter(c => !c.isCompleted);
      this.completedCourses = res.filter(c => c.isCompleted);

      this.filteredActiveCourses = [...this.activeCourses];
      this.filteredCompletedCourses = [...this.completedCourses];
    });
  }

  openCourse(courseId: string) {
    console.log("Opening course ",courseId);
  }

  filterCourses() {
    const term = this.searchText.toLowerCase();

    this.filteredActiveCourses = this.activeCourses.filter(c =>
      c.title.toLowerCase().includes(term) 
    );

    this.filteredCompletedCourses = this.completedCourses.filter(c =>
      c.title.toLowerCase().includes(term) 
    );
    
    this.activePage = 1;
    this.completedPage = 1;
  }

  get pagedActiveCourses(): MyCourse[] {
    const start = (this.activePage - 1) * this.activePageSize;
    return this.filteredActiveCourses.slice(start, start + this.activePageSize);
  }

  get pagedCompletedCourses(): MyCourse[] {
    const start = (this.completedPage - 1) * this.completedPageSize;
    return this.filteredCompletedCourses.slice(start, start + this.completedPageSize);
  }

  get activeTotalPages(): number {
    return Math.ceil(this.filteredActiveCourses.length / this.activePageSize);
  }

  get visibleActivePages(): number[] {
    return this.buildPages(this.activePage, this.activeTotalPages);
  }

  goActivePage(p: number) {
    if (p < 1 || p > this.activeTotalPages) return;
    this.activePage = p;
  }

  activeFirst() { this.activePage = 1; }
  activeLast() { this.activePage = this.activeTotalPages; }
  activePrev() { if (this.activePage > 1) this.activePage--; }
  activeNext() { if (this.activePage < this.activeTotalPages) this.activePage++; }

  get completedTotalPages(): number {
    return Math.ceil(this.filteredCompletedCourses.length / this.completedPageSize);
  }

  get visibleCompletedPages(): number[] {
    return this.buildPages(this.completedPage, this.completedTotalPages);
  }

  goCompletedPage(p: number) {
    if (p < 1 || p > this.completedTotalPages) return;
    this.completedPage = p;
  }

  completedFirst() { this.completedPage = 1; }
  completedLast() { this.completedPage = this.completedTotalPages; }
  completedPrev() { if (this.completedPage > 1) this.completedPage--; }
  completedNext() { if (this.completedPage < this.completedTotalPages) this.completedPage++; }

  private buildPages(current: number, total: number): number[] {
    const pages: number[] = [];
    if (total === 0) return pages;

    let start = Math.max(1, current - Math.floor(this.maxVisiblePages / 2));
    let end = start + this.maxVisiblePages - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  openDescModal(course: any) {
    this.selectedCourse = course;
    this.descModalOpen = true;
  }

  closeDescModal() {
    this.descModalOpen = false;
    this.selectedCourse = null;
  }

  showActive(): boolean {
    return this.courseFilter === 'all' || this.courseFilter === 'active';
  }

  showCompleted(): boolean {
    return this.courseFilter === 'all' || this.courseFilter === 'completed';
  }
}