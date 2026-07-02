import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Enrollment {
  id: string;
  username: string;
  courseName: string;
  enrolledAt: string;
}

export interface EnrollmentResponse {
  enrollments: Enrollment[];
  totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class AdminEnrollmentsService {
  private base = 'http://localhost:5188/api/admin/enrollments';

  constructor(private http: HttpClient) {}

  getEnrollments(
    page: number = 1, 
    pageSize: number = 10, 
    sortBy: string = 'EnrolledAt', 
    descending: boolean = true
  ): Observable<EnrollmentResponse> {
    return this.http.get<EnrollmentResponse>(
      `${this.base}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&descending=${descending}`, {withCredentials:true}
    );
  }

  deleteEnrollment(enrollmentId: string) {
    return this.http.delete(`${this.base}/${enrollmentId}`,{withCredentials:true});
  }
}