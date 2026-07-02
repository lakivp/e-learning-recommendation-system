import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LecturerDashboardService {

  private base = 'http://localhost:5188/api/lecturer/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(this.base, { withCredentials: true });
  }

  deleteEnrollment(id: string) {
    return this.http.delete(`${this.base}/enrollments/${id}`, { withCredentials: true });
  }
}