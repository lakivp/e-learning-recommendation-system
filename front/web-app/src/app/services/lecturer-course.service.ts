import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Course, Lesson } from './course.service';

export interface CourseComment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LecturerCourseService {
  private base = 'http://localhost:5188/api/lecturer/courses';

  constructor(private http: HttpClient) {}

  getMyCourses() {
    return this.http.get<Course[]>(this.base, { withCredentials: true });
  }

  getCourse(id: string) {
    return this.http.get<Course>(
      `${this.base}/${id}`,
      { withCredentials: true }
    );
  }

  createCourse(title: string, description: string) {
    return this.http.post<Course>(
      this.base,
      { title, description },
      { withCredentials: true }
    );
  }

  updateCourse(course: Course) {
    return this.http.put(this.base, course, { withCredentials: true });
  }

  deleteCourse(id: string) {
    return this.http.delete(`${this.base}/${id}`, { withCredentials: true });
  }

  addLessonWithFile(form: FormData) {
    return this.http.post<Lesson>(
      `${this.base}/lesson`,
      form,
      { withCredentials: true }
    );
  }

  updateLesson(courseId: string, lesson: Lesson) {
    return this.http.put(
      `${this.base}/lesson`,
      {
        courseId,
        lessonId: lesson.id,
        name: lesson.name,
        text: lesson.text
      },
      { withCredentials: true }
    );
  }

  deleteLesson(courseId: string, lessonId: string) {
    return this.http.delete(
      `${this.base}/lesson?courseId=${courseId}&lessonId=${lessonId}`,
      { withCredentials: true }
    );
  }

  uploadLessonFile(courseId: string, lessonId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('courseId', courseId);
    form.append('lessonId', lessonId);

    return this.http.post(
      `${this.base}/lesson/upload`,
      form,
      { withCredentials: true }
    );
  }

  deleteLessonFile(courseId: string, lessonId: string) {
    return this.http.delete(
      `${this.base}/lesson/file?courseId=${courseId}&lessonId=${lessonId}`,
      { withCredentials: true }
    );
  }

  getComments(courseId: string) {
    return this.http.get<CourseComment[]>(
      `${this.base}/${courseId}/comments`,
      { withCredentials: true }
    );
  }

    deleteComment(id: string) {
      return this.http.delete(
        `${this.base}/comments/${id}`,
        { withCredentials: true }
      );
  }
}