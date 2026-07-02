import { Component, OnInit } from '@angular/core';
import { AdminEnrollmentsService, Enrollment } from '../../services/admin-enrollments.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-enrollments.component.html',
  styleUrls: ['./admin-enrollments.component.css'],
})
export class AdminEnrollmentsComponent implements OnInit {
  allEnrollments: Enrollment[] = []; 
  pagedEnrollments: Enrollment[] = []; 
  page = 1;
  pageSize = 10;
  totalCount = 0;
  sortBy: 'username' | 'courseName' | 'enrolledAt' = 'enrolledAt';
  descending = true;
  searchText: string = '';

  constructor(private enrollmentService: AdminEnrollmentsService) {}

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments() {
      this.enrollmentService.getEnrollments().subscribe(res => {
      this.allEnrollments = res.enrollments;
      this.totalCount = res.totalCount;
      this.page = 1;
      this.applyFilterAndPagination();
    });
  }

  // filtriranje po username i courseName
  filter() {
    this.page = 1; // resetuj na prvu stranu
    this.applyFilterAndPagination();
  }

  private applyFilterAndPagination() {
    let filtered = this.allEnrollments;

    if (this.searchText.trim()) {
      const text = this.searchText.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.username.toLowerCase().includes(text) ||
          e.courseName.toLowerCase().includes(text)
      );
    }

    this.totalCount = filtered.length;

    const start = (this.page - 1) * this.pageSize;
    this.pagedEnrollments = filtered.slice(start, start + this.pageSize);
  }


  sort(column: 'username' | 'courseName' | 'enrolledAt') {
    if (this.sortBy === column) {
      this.descending = !this.descending;
    } else {
      this.sortBy = column;
      this.descending = true;
    }

    // sortiranje lokalno
    this.allEnrollments.sort((a, b) => {
      let valA: any = a[column];
      let valB: any = b[column];

      if (column === 'enrolledAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.descending ? 1 : -1;
      if (valA > valB) return this.descending ? -1 : 1;
      return 0;
    });

    this.applyFilterAndPagination();
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
        this.enrollmentService.deleteEnrollment(id).subscribe(() => {
          this.allEnrollments = this.allEnrollments.filter(e => e.id !== id);
          this.applyFilterAndPagination();

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

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get visiblePages(): number[] {
    const maxVisible = 4;

    let start = Math.max(1, this.page - 1);
    let end = start + maxVisible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFilterAndPagination();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.applyFilterAndPagination();
    }
  }

  goToFirst() {
    this.page = 1;
    this.applyFilterAndPagination();
  }

  goToLast() {
    this.page = this.totalPages;
    this.applyFilterAndPagination();
  }

  setPage(p: number) {
    this.page = p;
    this.applyFilterAndPagination();
  }

}