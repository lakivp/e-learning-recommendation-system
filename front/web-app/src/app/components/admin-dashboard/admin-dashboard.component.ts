import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  dashboard: any;

  page = 1;
  pageSize = 8;
  totalPages = 0;

  topUsers: { username: string, courses: number }[] = [];
  maxCourses: number = 0;

  topCourses: { title: string, students: number }[] = [];
  maxStudents: number = 0;

  topCompletedUsers: { username: string, completed: number }[] = [];
  maxCompleted: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {

    this.adminService.getDashboard().subscribe(res => {
      this.dashboard = res;
      this.totalPages = Math.ceil((this.dashboard.recentUsers?.length || 0) / this.pageSize);

      this.topUsers = this.dashboard.topUsers ?? [];
      this.topCourses = this.dashboard.topCourses ?? [];
      this.topCompletedUsers = this.dashboard.topCompletedUsers ?? [];

      this.maxCourses = this.topUsers.length > 0 ? Math.max(...this.topUsers.map(u => u.courses)) : 0;
      this.maxStudents = this.topCourses.length > 0 ? Math.max(...this.topCourses.map(u => u.students)) : 0;
      this.maxCompleted = this.topCompletedUsers.length > 0 ? Math.max(...this.topCompletedUsers.map(u => u.completed)) : 0;

      this.createChart();
    });
  }

  createChart() {
    if (!this.dashboard?.registrationStats) return;

    const labels = this.dashboard.registrationStats.map((x: any) => x.date);
    const data = this.dashboard.registrationStats.map((x: any) => x.count);

    const maxValue = Math.max(...data, 0);

    new Chart("usersChart", {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'User Registrations',
          data: data,
          borderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            suggestedMax: maxValue < 7 ? 7 : maxValue + 1,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // Paginacija recent users
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
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
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

  get paginatedUsers() {
    if (!this.dashboard?.recentUsers) return [];

    const start = (this.page - 1) * this.pageSize;
    return this.dashboard.recentUsers.slice(start, start + this.pageSize);
  }
}