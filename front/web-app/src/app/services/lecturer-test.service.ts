import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TestQuestion {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface CourseTest {
  id?: string;
  courseId: string;
  title: string;
  passPercentage?: number;
  durationMinutes: number;
  questions: TestQuestion[];
}

export interface CreateTestDto {
  courseId: string;
  title: string;
  durationMinutes: number | null;
  requiredCorrect: number | null;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class LecturerTestService {

  private base = 'http://localhost:5188/api/lecturer/tests';

  constructor(private http: HttpClient) {}

  getTest(courseId: string) {
    return this.http.get<CourseTest>(
      `${this.base}/course/${courseId}`,
      { withCredentials: true }
    );
  }

  createTest(dto: CreateTestDto) {
    return this.http.post<CourseTest>(
      this.base,
      dto,
      { withCredentials: true }
    );
  }

  updateTest(testId: string, dto:CreateTestDto) {
    return this.http.put(
      `${this.base}/${testId}`,
      dto,
      { withCredentials: true }
    );
  }

  deleteTest(id: string) {
    return this.http.delete(
      `${this.base}/${id}`,
      { withCredentials: true }
    );
  }

  addQuestion(testId: string, q: TestQuestion) {
    return this.http.post(
      `${this.base}/${testId}/questions`,
      q,
      { withCredentials: true }
    );
  }

  deleteQuestion(testId: string, questionId: string) {
    return this.http.delete(
      `${this.base}/${testId}/questions/${questionId}`,
      { withCredentials: true }
    );
  }
}