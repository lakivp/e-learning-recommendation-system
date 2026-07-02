import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BrowseCourse {
  id: string;
  title: string;
  description: string;
  isEnrolled: boolean;
}

export interface MyCourse {
  courseId: string;
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

export interface Lesson {
  id: string;
  name: string;
  text: string;
  filePath: string;
  number: number;       
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Comment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  isMine: boolean;
}

export interface CourseTest {
  testId: string;
  title: string;
  requiredCorrect: number;
  questions: TestQuestion[];
  durationMinutes: number;
}

export interface TestQuestion {
  id: string;
  text: string;
  answers: TestAnswer[];
}

export interface TestAnswer {
  id: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class UserCourseService {
  private base = 'http://localhost:5188/api/user/courses';
  private base1 = 'http://localhost:5188/api/user/tests';

  constructor(private http: HttpClient) {}

  // Svi kursevi koje korisnik može da vidi
  browse(): Observable<BrowseCourse[]> {
    return this.http.get<BrowseCourse[]>(`${this.base}/browse`,{withCredentials:true});
  }

  // Upis na kurs
  enroll(courseId: string) {
    return this.http.post(`${this.base}/${courseId}/enroll`, {},{withCredentials:true});
  }

  // Kursevi na koje je korisnik upisan
  getMyCourses(): Observable<MyCourse[]> {
    return this.http.get<MyCourse[]>(`${this.base}/my`,{withCredentials:true});
  }

  // ======================================================
  // Lekcije kursa
  // ======================================================
  getLessons(courseId: string): Observable<Lesson[]> {
    return this.http.get<{ lessons: Lesson[] }>(`${this.base}/${courseId}`,{withCredentials:true})
      .pipe(
        map(res => res.lessons ?? [])
      );
  }
  // Obeležavanje lekcije kao završene
  completeLesson(courseId: string, lessonId: string) {
    return this.http.post(`${this.base}/${courseId}/lesson/${lessonId}/complete`, {},{withCredentials:true});
  }

  // Download fajla lekcije
  downloadFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.base}/lesson/download?fileName=${fileName}`, { responseType: 'blob', withCredentials:true });
  }

  // ======================================================
  // Komentari
  // ======================================================
  getComments(courseId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}/${courseId}/comments`,{withCredentials:true});
  }

  addComment(courseId: string, text: string) {
    return this.http.post<Comment>(`${this.base}/${courseId}/comments`, { text },{withCredentials:true});
  }

  editComment(id: string, text: string) {
    return this.http.put(`${this.base}/comments/${id}`, { text },{withCredentials:true});
  }

  deleteComment(id: string) {
    return this.http.delete(`${this.base}/comments/${id}`,{withCredentials:true});
  }

  getCourseTest(courseId: string) {
    return this.http.get<CourseTest>(
      `${this.base1}/course/${courseId}`,
      { withCredentials: true }
    );
  }

  submitTest(testId: string, answers: any) {
    return this.http.post<any>(
      `${this.base1}/${testId}/submit`,
      { answers },
      { withCredentials: true }
    );
  }

  getTestStatus(testId: string) {
    return this.http.get<{ passed: boolean }>(
      `${this.base1}/${testId}/status`
    );
  }

  getCourseStatus(courseId: string) {
    return this.http.get<{
      completed: boolean;
      completedAt?: string;
    }>(
      `${this.base1}/course/${courseId}/course-status`,
      { withCredentials: true }
    );
  }

}