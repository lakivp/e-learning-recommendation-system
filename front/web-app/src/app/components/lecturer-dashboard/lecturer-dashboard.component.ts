import { Component, OnInit } from '@angular/core';
import { LecturerDashboardService } from '../../services/lecturer-dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lecturer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-dashboard.component.html',
  styleUrls: ['./lecturer-dashboard.component.css']
})
export class LecturerDashboardComponent implements OnInit {

  dashboard: any = {
    topCourses: [],
    topCompletedCourses: [],
    topCompletedUsers: [],
    enrollments: []
  };

  page = 1;
  pageSize = 8;
  totalPages = 0;

  enrollments: any[] = [];
  pagedEnrollments: any[] = [];

  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  maxStudents = 0;
  maxCompleted = 0;

  topUsers: any[] = [];
  maxUserCompleted = 0;

  constructor(private service: LecturerDashboardService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getDashboard().subscribe(res => {
      this.dashboard = res;
      this.enrollments = res.enrollments;
      this.totalPages = Math.ceil(this.enrollments.length / this.pageSize);

      this.maxStudents = Math.max(...res.topCourses.map((c:any)=>c.students), 1);
      this.maxCompleted = Math.max(...res.topCompletedCourses.map((c:any)=>c.completed), 1);

      this.topUsers = res.topCompletedUsers || [];
      this.maxUserCompleted = Math.max(...this.topUsers.map(u=>u.completed),1);

      this.updatePaged();
    });
  }

  updatePaged() {
    const start = (this.page - 1) * this.pageSize;
    this.pagedEnrollments = this.enrollments.slice(start, start + this.pageSize);
  }

  // pagination
  get visiblePages() {
    const maxVisible = 4;
    let start = Math.max(this.page - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  setPage(p:number){ this.page=p; this.updatePaged(); }
  nextPage(){ if(this.page<this.totalPages){this.page++;this.updatePaged();}}
  prevPage(){ if(this.page>1){this.page--;this.updatePaged();}}
  goToFirst(){this.page=1;this.updatePaged();}
  goToLast(){this.page=this.totalPages;this.updatePaged();}

  // sort
  sort(field: string) {
    this.sortDir = this.sortField === field && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortField = field;

    this.enrollments.sort((a,b)=>{
      const valA = a[field];
      const valB = b[field];
      return this.sortDir === 'asc'
        ? valA > valB ? 1 : -1
        : valA < valB ? 1 : -1;
    });

    this.updatePaged();
  }

  deleteEnrollment(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this enrollment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',   
      cancelButtonColor: '#9ca3af',    
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {
        this.service.deleteEnrollment(id).subscribe(() => {
          this.enrollments = this.enrollments.filter(e => e.id !== id);
          this.updatePaged();

          Swal.fire({
            title: 'Deleted!',
            text: 'Enrollment has been successfully removed.',
            icon: 'success',
            confirmButtonColor: '#2563eb'   
          });
        });
      }

    });
  }

  searchText: string = '';
  filter() {
    const term = this.searchText.toLowerCase();

    this.enrollments = this.dashboard.enrollments.filter((e: any) =>
      e.username.toLowerCase().includes(term) ||
      e.courseName.toLowerCase().includes(term)
    );

    this.page = 1;
    this.totalPages = Math.ceil(this.enrollments.length / this.pageSize);
    this.updatePaged();
  }
}