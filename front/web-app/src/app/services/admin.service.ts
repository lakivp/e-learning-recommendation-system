import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newUsersToday: number;
  recentUsers: any[];
  registrationStats: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  api = "http://localhost:5188/api/admin";

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.api}/dashboard`);
  }
}