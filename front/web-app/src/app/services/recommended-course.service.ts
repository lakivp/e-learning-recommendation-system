import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  isEnrolled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendedCourseService {

  private apiUrl = 'http://localhost:5188/api/user';

  constructor(private http: HttpClient) {}

  getRecommended() {
    return this.http.get<RecommendedCourse[]>(`${this.apiUrl}/recommendations`,{withCredentials:true});
  }

  enroll(courseId: string) {
    return this.http.post(
      `${this.apiUrl}/courses/${courseId}/enroll`,
      {},{withCredentials:true}
    );
  }
}