import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminRequestService } from '../../services/admin-request.service';

@Component({
  standalone: true,
  selector: 'app-admin-lecturer-requests',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-lecturer-requests.component.html',
  styleUrls: ['./admin-lecturer-requests.component.css']
})
export class AdminLecturerRequestsComponent implements OnInit {

  requests: any[] = [];
  filteredRequests: any[] = [];

  searchTerm = '';

  page = 1;
  pageSize = 10;
  totalPages = 0;

  sortField: string = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  loading = false;

  constructor(private admin: AdminRequestService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.admin.getLecturerRequests().subscribe(res => {
      this.requests = res;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();

    this.filteredRequests = this.requests.filter(r =>
      r.username.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term)
    );

    this.sort();
    this.page = 1;
    this.totalPages = Math.ceil(this.filteredRequests.length / this.pageSize);
  }

  sort(field?: string) {
    if (field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    }

    this.filteredRequests.sort((a, b) => {
      const valA = a[this.sortField];
      const valB = b[this.sortField];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedRequests() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  // pagination helpers
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
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

   goToFirst() {
    this.page = 1;
  }

  goToLast() {
    this.page = this.totalPages;
  }

  setPage(p: number) {
    this.page = p;
  }

  approve(id: string) {
    this.admin.approveLecturer(id).subscribe(() => {
      Swal.fire('Approved', 'User is now a lecturer', 'success');
      this.load();
    });
  }

  reject(id: string) {
    Swal.fire({
      title: 'Reject request?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.admin.rejectLecturer(id).subscribe(() => {
          Swal.fire('Rejected', '', 'success');
          this.load();
        });
      }
    });
  }
}