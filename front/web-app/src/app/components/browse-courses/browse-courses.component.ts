import { Component, OnInit } from '@angular/core';
import { UserCourseService, BrowseCourse } from '../../services/user-course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-browse-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse-courses.component.html',
  styleUrl: './browse-courses.component.css'
})
export class BrowseCoursesComponent implements OnInit {

  courses: BrowseCourse[] = [];
  allCourses: BrowseCourse[] = [];
  descModalOpen = false;
  selectedCourse: any = null;
  searchText = '';
  page = 1;
  pageSize = 10;

  totalPages = 0;
  maxVisiblePages = 4;

  constructor(private service: UserCourseService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.browse().subscribe(res => {
      this.courses = res;
      this.allCourses = [...res];
      this.setupPagination();
    });
  }

  enroll(course: BrowseCourse) {
    this.service.enroll(course.id).subscribe(() => {
      Swal.fire("Success", "You have successfully enrolled in the course", "success");
      this.router.navigate(['/user/my-courses']);
      course.isEnrolled = true;
    });
  }

  filter() {
    const t = this.searchText.toLowerCase();
    this.courses = this.allCourses.filter(c =>
      c.title.toLowerCase().includes(t) //||
      //c.description.toLowerCase().includes(t)
    );
    this.page = 1;
    this.setupPagination();
  }


  get pagedCourses() {
    const start = (this.page - 1) * this.pageSize;
    return this.courses.slice(start, start + this.pageSize);
  }


  openDescModal(course: any) {
    this.selectedCourse = course;
    this.descModalOpen = true;
  }

  closeDescModal() {
    this.descModalOpen = false;
    this.selectedCourse = null;
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.courses.length / this.pageSize);
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