import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityDto, AdminActivityService, RecentActivityResponse } from '../../services/admin-activity.service';

@Component({
  selector: 'app-admin-users-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-activity.component.html',
  styleUrls: ['./admin-users-activity.component.css']
})
export class AdminUsersActivityComponent implements OnInit {

  users: any[] = [];
  selectedUserId: string | null = null;
  selectedUser: any;
  recentActivity: ActivityDto[] = [];

  searchText: string = '';
  filteredUsers: any[] = [];
  showDropdown: boolean = false;


  weeks: { date: Date | null, count: number }[][] = [];
  monthLabels: { index: number, label: string }[] = [];

  constructor(private activityService: AdminActivityService) {}

  ngOnInit() {
    this.activityService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = [...users]; 
    });
  }

  onUserChange() {
    this.selectedUser = this.users.find(u => u.id === this.selectedUserId);

    if (!this.selectedUserId) return;

    this.activityService
      .getUserHeatmap(this.selectedUserId)
      .subscribe(data => this.buildHeatmap(data));

    this.activityService
      .getUserRecentActivity(this.selectedUserId)
      .subscribe(res => this.recentActivity = res.recentActivity);
  }

  buildHeatmap(data: any[]) {
    const activityMap = new Map<string, number>();
    data.forEach(a =>
      activityMap.set(new Date(a.date).toDateString(), a.count)
    );

    const NUM_WEEKS = 52;
    const weeks: any[][] = [];
    this.monthLabels = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // kraj = sledeca nedelja (nedelja = 0)
    const end = new Date(today);
    while (end.getDay() !== 0) {
      end.setDate(end.getDate() + 1);
    }

    let current = new Date(end);
    const addedMonths = new Set<number>(); 

    for (let w = 0; w < NUM_WEEKS; w++) {
      const week: any[] = [];

      for (let d = 0; d < 7; d++) {
        const date = new Date(current);
        const key = date.toDateString();

        week.unshift(
          date > today
            ? { date: null, count: 0 }
            : { date, count: activityMap.get(key) || 0 }
        );

        current.setDate(current.getDate() - 1);
      }

      const monday = week[0];

      if (monday?.date) {
        const month = monday.date.getMonth();
        const dayOfMonth = monday.date.getDate();

        if (dayOfMonth <= 7 && !addedMonths.has(month)) {
          this.monthLabels.push({
            index: NUM_WEEKS - w,
            label: monday.date.toLocaleString('en', { month: 'short' })
          });
          addedMonths.add(month);
        }
      }

      weeks.unshift(week);
    }

    this.weeks = weeks;
  }
  getColor(count: number): string {
    if (count === 0) return '#ebedf0';
    if (count < 3) return '#9be9a8';
    if (count < 6) return '#40c463';
    if (count < 9) return '#30a14e';
    return '#216e39';
  }

  formatTooltip(d: any): string {
    if (!d.date) return '';

    const date = d.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return d.count === 0
      ? `No activity on ${date}`
      : `${d.count} activities on ${date}`;
  }

  tooltipData: any = null;
  tooltipX = 0;
  tooltipY = 0;

  showTooltip(event: MouseEvent, d: any) {

    if (!d.date || d.date > new Date()) {
      return;
    }
    
    this.tooltipData = d;

    const tooltipWidth = 120; 
    const tooltipHeight = 28; 

    let x = event.clientX;
    let y = event.clientY - tooltipHeight - 8; 

    const screenWidth = window.innerWidth;
    if (x + tooltipWidth / 2 > screenWidth) x = screenWidth - tooltipWidth / 2 - 8;
    if (x - tooltipWidth / 2 < 0) x = tooltipWidth / 2 + 8;

    if (y < 0) y = event.clientY + 8;

    this.tooltipX = x;
    this.tooltipY = y;
  }

  hideTooltip() {
    this.tooltipData = null;
  }

  icon(type: string) {
    switch(type){
      case 'enroll': return '📘';
      case 'lesson': return '✅';
      case 'test': return '📝';
      case 'course': return '🎓';
      case 'comment': return '💬';
      default: return '•';
    }
  }
  isFuture(date: Date | null): boolean {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d.getTime() > today.getTime();
  }

  filterUsers() {
    const term = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
    this.showDropdown = true;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectUser(user: any) {
    this.selectedUserId = user.id;
    this.selectedUser = user;
    this.searchText = `${user.username} (${user.email})`;
    this.showDropdown = false;
    this.onUserChange();
  }

  
}

