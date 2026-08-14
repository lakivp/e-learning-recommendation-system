import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface RegistrationStat { date: string; count: number; }
interface TopUser { username: string; courses: number; }
interface TopCourse { title: string; students: number; }
interface TopCompletedUser { username: string; completed: number; }
interface RecentUser { id?: number | string; username: string; email: string; role?: string; isActive?: boolean; createdAt?: string; }
interface Dashboard { totalUsers?: number; activeUsers?: number; disabledUsers?: number; newUsersToday?: number; recentUsers?: RecentUser[]; topUsers?: TopUser[]; topCourses?: TopCourse[]; topCompletedUsers?: TopCompletedUser[]; registrationStats?: RegistrationStat[]; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit, OnDestroy {

  dashboard: Dashboard | null = null;

  page = 1;
  readonly pageSize = 8;
  totalPages = 0;

  topUsers: TopUser[] = [];
  maxCourses = 0;

  topCourses: TopCourse[] = [];
  maxStudents = 0;

  topCompletedUsers: TopCompletedUser[] = [];
  maxCompleted = 0;

  private destroy$ = new Subject<void>();
  private usersChart?: Chart;

  @ViewChild('usersChart') usersChartRef?: ElementRef<HTMLCanvasElement>;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.dashboard = res;
      this.totalPages = Math.ceil((this.dashboard?.recentUsers?.length || 0) / this.pageSize);

      this.topUsers = this.dashboard?.topUsers ?? [];
      this.topCourses = this.dashboard?.topCourses ?? [];
      this.topCompletedUsers = this.dashboard?.topCompletedUsers ?? [];

      this.maxCourses = this.topUsers.length > 0 ? Math.max(...this.topUsers.map(u => u.courses)) : 0;
      this.maxStudents = this.topCourses.length > 0 ? Math.max(...this.topCourses.map(u => u.students)) : 0;
      this.maxCompleted = this.topCompletedUsers.length > 0 ? Math.max(...this.topCompletedUsers.map(u => u.completed)) : 0;

      this.createChart();
    });
  }

  createChart(): void {
    if (!this.dashboard?.registrationStats || !this.usersChartRef) return;

    const labels = this.dashboard.registrationStats.map((x: RegistrationStat) => x.date);
    const data = this.dashboard.registrationStats.map((x: RegistrationStat) => x.count);

    const maxValue = Math.max(...data, 0);

    if (this.usersChart) {
      this.usersChart.destroy();
      this.usersChart = undefined;
    }

    const ctx = this.usersChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.usersChart = new Chart(ctx, {
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
    if (this.totalPages <= 0) return [];

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, Math.min(this.page - half, Math.max(1, this.totalPages - maxVisible + 1)));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  goToFirst(): void {
    this.page = 1;
  }

  goToLast(): void {
    this.page = this.totalPages;
  }

  setPage(p: number): void {
    this.page = p;
  }

  get paginatedUsers(): RecentUser[] {
    if (!this.dashboard?.recentUsers) return [];

    const start = (this.page - 1) * this.pageSize;
    return this.dashboard.recentUsers.slice(start, start + this.pageSize);
  }

  trackByUser(_index: number, user: RecentUser): number | string {
    return user?.id ?? _index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.usersChart) {
      this.usersChart.destroy();
      this.usersChart = undefined;
    }
  }
}