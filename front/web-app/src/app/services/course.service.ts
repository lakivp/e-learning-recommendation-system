import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lesson {
  id: string;
  courseId?: string;
  name: string;
  text?: string;
  filePath?: string;
  expanded?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Comment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private base = 'http://localhost:5188/api/admin/courses';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> { 
    return this.http.get<Course[]>(this.base,{withCredentials:true}); 
  }
  getCourse(id: string): Observable<Course> { 
    return this.http.get<Course>(`${this.base}/${id}`,{withCredentials:true}); 
  }
  createCourse(title: string, desc: string) { 
    return this.http.post<Course>(this.base, { title, description: desc },{withCredentials:true}); 
  }
  updateCourse(course: Course) { 
    return this.http.put(this.base, course,{withCredentials:true}); 
  }
  deleteCourse(id: string) { 
    return this.http.delete(`${this.base}/${id}`,{withCredentials:true}); 
  }

  addLesson(courseId: string, name: string, text: string) { 
    return this.http.post<Lesson>(`${this.base}/lesson`, { courseId, name, text },{withCredentials:true}); 
  }
  updateLesson(courseId: string, lesson: Lesson) {
    return this.http.put(`${this.base}/lesson`, { courseId, lessonId: lesson.id, name: lesson.name, text: lesson.text },{withCredentials:true});
  }
  deleteLesson(courseId: string, lessonId: string) {
    return this.http.delete(`${this.base}/lesson?courseId=${courseId}&lessonId=${lessonId}`,{withCredentials:true});
  }
  uploadLessonFile(courseId: string, lessonId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('courseId', courseId);
    form.append('lessonId', lessonId);
    return this.http.post(`${this.base}/lesson/upload`, form,{withCredentials:true});
  }

  getComments(id: string) { 
    return this.http.get<Comment[]>(`${this.base}/${id}/comments`,{withCredentials:true}); 
  }
  deleteComment(id: string) { 
    return this.http.delete(`${this.base}/comments/${id}`,{withCredentials:true}); 
  }

  deleteLessonFile(courseId: string, lessonId: string) {
     return this.http.delete(`${this.base}/lesson/file?courseId=${courseId}&lessonId=${lessonId}`,{withCredentials:true});
  }

  
  addLessonWithFile(form: FormData) {
    return this.http.post<Lesson>(`${this.base}/lesson`, form,{withCredentials:true});
  }
}

