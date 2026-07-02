import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminTestService {

  constructor(private http: HttpClient) {}

  private base = 'http://localhost:5188/api/admin/tests';

  getTestByCourse(courseId: string) {
    return this.http.get<any>(`${this.base}/course/${courseId}`);
  }

  deleteTest(testId: string) {
    return this.http.delete(`${this.base}/${testId}`);
  }
  
}