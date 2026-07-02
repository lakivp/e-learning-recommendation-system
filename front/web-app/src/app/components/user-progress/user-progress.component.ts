import { Component, OnInit } from '@angular/core';
import { DayActivity, UserProgressService } from '../../services/user-progress.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {BaseChartDirective} from 'ng2-charts'

@Component({
  selector: 'app-user-progress',
  standalone:true,
  imports:[CommonModule,FormsModule,BaseChartDirective],
  templateUrl: './user-progress.component.html',
  styleUrls: ['./user-progress.component.css']
})
export class UserProgressComponent implements OnInit {

  completedToday = 0;
  completedWeek = 0;
  heatmap: any[] = [];

  weeks: { date: Date | null, count: number }[][] = [];
  monthLabels: { index: number, label: string }[] = [];

  constructor(private progressService: UserProgressService) {}

  ngOnInit() {
    this.progressService.getSummary().subscribe(r => {
      this.completedToday = r.completedToday;
      this.completedWeek = r.completedLast7Days;
    });

    this.progressService.getHeatmap().subscribe(r => {
      const activityMap = new Map<string, number>();
      r.forEach(a => {
        activityMap.set(new Date(a.date).toDateString(), a.count);
      });

      const NUM_WEEKS = 52;
      const weeks: { date: Date | null; count: number }[][] = [];
      this.monthLabels = [];

      const today = new Date();
      const end = new Date(today);

      // završi u nedelji (nedelja)
      while (end.getDay() !== 0) {
        end.setDate(end.getDate() + 1);
      }

      let current = new Date(end);
      let lastMonth: number | null = null;

      for (let w = 0; w < NUM_WEEKS; w++) {
        const week: { date: Date | null; count: number }[] = [];

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

        // prvi ponedeljak u mesecu
        const monday = week[0];
        if (monday?.date) {
          const month = monday.date.getMonth();
          const isFirstMonday =
            monday.date.getDate() <= 7;

          if (isFirstMonday && month !== lastMonth) {
            this.monthLabels.push({
              index: NUM_WEEKS - w,
              label: monday.date.toLocaleString('en', { month: 'short' })
            });
            lastMonth = month;
          }
        }
        weeks.unshift(week);
      }

      this.weeks = weeks;
    });
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

  isFuture(date: Date | null): boolean {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return d.getTime() > today.getTime();
  }

  // ===== DAILY ACTIVITIES =====
  selectedDay: Date | null = null;
  dayActivities: any[] = [];


  onDayClick(d: any) {
    if (!d.date) return;

    this.selectedDate = d.date;
    this.activityPage = 1;

    const iso = d.date.toISOString();

    this.progressService.getActivitiesByDay(iso)
      .subscribe(res => {
        this.dayActivities = res;
      });
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


  selectedDate: Date | null = null;

  // paginacija
  activityPage = 1;
  activityPageSize = 5;

  get visibleActivityPages(): number[] {
    const totalPages = this.totalActivityPages;
    const maxVisible = 4;

    let start = Math.max(this.activityPage - 1, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get paginatedActivities(): DayActivity[] {
    const start = (this.activityPage - 1) * this.activityPageSize;
    return this.dayActivities.slice(start, start + this.activityPageSize);
  }

  get totalActivityPages(): number {
    return Math.ceil(this.dayActivities.length / this.activityPageSize);
  }

  get activityPages(): number[] {
    return Array.from({ length: this.totalActivityPages }, (_, i) => i + 1);
  }
  
  setActivityPage(p: number) {
    this.activityPage = p;
  }

  goActivityFirst() 
  { 
    this.activityPage = 1; 
  }
  goActivityLast() 
  { 
    this.activityPage = this.totalActivityPages; 
  }
  goActivityPrev() 
  { 
    if (this.activityPage > 1) this.activityPage--; 
  }
  goActivityNext() 
  { 
    if (this.activityPage < this.totalActivityPages) this.activityPage++; 
  }

}