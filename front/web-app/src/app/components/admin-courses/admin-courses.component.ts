import { Component, OnInit } from '@angular/core';
import { CourseService, Course } from '../../services/course.service';
import { AdminEnrollmentsService } from '../../services/admin-enrollments.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.css']
})
export class AdminCoursesComponent implements OnInit {

  courses: Course[] = [];
  filteredCourses: Course[] = [];
  pagedCourses: Course[] = [];

  searchTerm = '';

  page = 1;
  pageSize = 10;

  totalPages = 0;
  maxVisiblePages = 4;

  editingCourse: Course | null = null;

  addingCourse = false;
  newCourse = {
    title: '',
    description:''
  }
  fullDescCourse: Course | null = null;
  constructor(
    public courseService: CourseService,
    public router: Router,
    public adminEnrollmentsService: AdminEnrollmentsService
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
      this.filteredCourses = courses;
      this.setupPagination();
    });
  }

  searchCourses() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredCourses = this.courses;
    } else {
      this.filteredCourses = this.courses.filter(course =>
        course.title.toLowerCase().includes(term)
      );
    }

    this.page = 1; // resetuj na prvu stranu
    this.setupPagination();
  }

  deleteCourse(courseId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this course?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',   
      cancelButtonColor: '#9ca3af',    
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {
        this.courseService.deleteCourse(courseId).subscribe(() => {
          this.loadCourses();
          this.adminEnrollmentsService.getEnrollments();

          Swal.fire({
            title: 'Deleted!',
            text: 'The course has been successfully removed.',
            icon: 'success',
            confirmButtonColor: '#2563eb'   
          });
        });
      }

    });
  }

  openEditModal(course: Course) {
    this.editingCourse = { ...course };
  }

  closeModal() {
    this.editingCourse = null;
  }

  saveEdit() {

    if (!this.editingCourse) return;

    this.courseService.updateCourse(this.editingCourse)
      .subscribe(() => {

        this.loadCourses();
        this.closeModal();

      });
  }

  openAddModal() {
    this.addingCourse = true;
  }

  closeAddModal() {
    this.addingCourse = false;
    this.newCourse = { title: '', description: '' };
  }

  saveNewCourse() {

    if (!this.newCourse.title.trim()) return;

    this.courseService
      .createCourse(this.newCourse.title, this.newCourse.description)
      .subscribe(() => {

        this.loadCourses();
        this.closeAddModal();

      });
  }

  openDescModal(course: Course) {
    this.fullDescCourse = course;
  }

  closeDescModal() {
    this.fullDescCourse = null;
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.filteredCourses.length / this.pageSize);
    if(this.page > this.totalPages) this.page = this.totalPages || 1;
    this.updatePagedCourses();
  }

  updatePagedCourses() {
    const start = (this.page - 1) * this.pageSize;
    this.pagedCourses = this.filteredCourses.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];

    if (this.totalPages === 0) return pages;

    let start = Math.max(1, this.page - Math.floor(this.maxVisiblePages / 2));
    let end = start + this.maxVisiblePages - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.updatePagedCourses();
  }

  goFirst() {
    this.page = 1;
    this.updatePagedCourses();
  }

  goLast() {
    this.page = this.totalPages;
    this.updatePagedCourses();
  }

  goPrev() {
    if (this.page > 1) this.page--;
    this.updatePagedCourses();
  }

  goNext() {
    if (this.page < this.totalPages) this.page++;
    this.updatePagedCourses();
  }

}