import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RecommendedCourseService } from '../../services/recommended-course.service';
import { RecommendedCourse } from '../../services/recommended-course.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recommended-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommended-courses.component.html',
  styleUrl: './recommended-courses.component.css'
})
export class RecommendedCoursesComponent implements OnInit {

  courses: RecommendedCourse[] = [];
  allCourses: RecommendedCourse[] = [];

  searchText = '';
  page = 1;
  pageSize = 10;

  totalPages = 0;
  maxVisiblePages = 4;
  loading = false;


  descModalOpen = false;
  selectedCourse: RecommendedCourse | null = null;

  constructor(private service: RecommendedCourseService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getRecommended().subscribe(res => {
      this.courses = res;
      this.allCourses = [...res];
      this.setupPagination();
      this.loading = false;
    });
  }

  enroll(course: RecommendedCourse) {
    this.service.enroll(course.id).subscribe(() => {
      Swal.fire("Success", "You have enrolled", "success");
      this.router.navigate(['/user/my-courses']);
      course.isEnrolled = true;
    });
  }

  filter() {
    const t = this.searchText.toLowerCase();
    this.courses = this.allCourses.filter(c =>
      c.title.toLowerCase().includes(t)
    );
    this.page = 1;
    this.setupPagination();
  }

  get pagedCourses() {
    const start = (this.page - 1) * this.pageSize;
    return this.courses.slice(start, start + this.pageSize);
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.courses.length / this.pageSize);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    let start = Math.max(1, this.page - 2);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number) {
    this.page = p;
  }

  openDescModal(course: RecommendedCourse) {
    this.selectedCourse = course;
    this.descModalOpen = true;
  }

  closeDescModal() {
    this.descModalOpen = false;
    this.selectedCourse = null;
  }

  goFirst() {
    this.page = 1;
  }

  goLast() {
    this.page = this.totalPages;
  }

  goPrev() {
    if (this.page > 1) this.page--;
  }

  goNext() {
    if (this.page < this.totalPages) this.page++;
  }
}