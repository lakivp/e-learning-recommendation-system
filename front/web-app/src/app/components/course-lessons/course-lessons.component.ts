import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserCourseService, Lesson, Comment, CourseTest } from '../../services/user-course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-course-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-lessons.component.html',
  styleUrls: ['./course-lessons.component.css']
})
export class CourseLessonsComponent implements OnInit {

  courseId: string = "";

  lessons: Lesson[] = [];              
  filteredLessons: Lesson[] = [];     

  comments: Comment[] = [];
  commentText: string = "";

  search: string = "";
  currentPage = 1;
  pageSize = 12;

  testPassed = false;

  test:CourseTest | null = null;
  allLessonsCompleted = false;
  testModalOpen = false;
  confirmTestModalOpen = false;

  timeExpired = false;

  constructor(
    private route: ActivatedRoute,
    private service: UserCourseService,
    private http:HttpClient
  ) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get("id")!;
    this.loadLessons();
    this.loadComments();
    this.loadTest();
  }

  loadLessons() {
    this.service.getLessons(this.courseId).subscribe(res => {
      this.lessons = res;          
      this.filteredLessons = [...this.lessons];
      this.allLessonsCompleted = this.lessons.every(l => l.isCompleted);
    });
  }

  loadComments() {
    this.service.getComments(this.courseId).subscribe(res => {
      this.comments = res;
    });
  }

  completeLesson(lesson: Lesson) {
    this.service.completeLesson(this.courseId, lesson.id).subscribe(() => {
      lesson.isCompleted = true;
      this.allLessonsCompleted = this.lessons.every(l => l.isCompleted);
      Swal.fire({
        icon: 'success',
        title: 'Lesson completed!',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredLessons.length / this.pageSize);
  }

  addComment() {
    if (!this.commentText.trim()) return;

    this.service.addComment(this.courseId, this.commentText).subscribe(() => {
      this.commentText = "";
      this.loadComments();
    });
  }

  editComment(c: Comment) {
    const text = prompt("Edit comment", c.text);
    if (!text) return;
    this.service.editComment(c.id, text).subscribe(() => {
      c.text = text;
      this.loadComments();
    });
  }

  deleteComment(id: string) {
    this.service.deleteComment(id).subscribe(() => {
          this.comments = this.comments.filter(x => x.id !== id);
          this.loadComments();
        });
  }

  getFileName(path?: string):string{
    if(!path) return '';
      return path.split('/').pop()!;
  }

  getFileIcon(path?: string) {

    if (!path) return 'fa-file';

    if (path.endsWith('.pdf')) return 'fa-file-pdf';
    if (path.endsWith('.ppt') || path.endsWith('.pptx')) return 'fa-file-powerpoint';
    if (path.endsWith('.doc') || path.endsWith('.docx')) return 'fa-file-word';

    return 'fa-file';
  }

  textModalOpen = false;
  textModalLesson: Lesson | null = null;
  

  openTextModal(lesson: Lesson) {
      this.textModalLesson = lesson;
      this.textModalOpen = true;
  }
  
  closeTextModal() {
      this.textModalOpen = false;
      this.textModalLesson = null;
  }
  
  commentPage: number = 1;
  commentPageSize: number = 5;

  get paginatedComments(): Comment[] {
    const start = (this.commentPage - 1) * this.commentPageSize;
    return this.comments.slice(start, start + this.commentPageSize);
  }

  get totalCommentPages(): number {
    return Math.ceil(this.comments.length / this.commentPageSize);
  }

  get commentPages(): number[] {
    return Array.from({ length: this.totalCommentPages }, (_, i) => i + 1);
  }

  setCommentPage(p: number) { this.commentPage = p; }

  goCommentsFirst() { this.commentPage = 1; }
  goCommentsLast() { this.commentPage = this.totalCommentPages; }
  goCommentsPrev() { if(this.commentPage > 1) this.commentPage--; }
  goCommentsNext() { if(this.commentPage < this.totalCommentPages) this.commentPage++; }
  
  editingCommentId: string | null = null;
  editingCommentText: string = '';

  startEditing(c: Comment) {
    this.editingCommentId = c.id;
    this.editingCommentText = c.text;
  }

  saveComment(c: Comment) {
    if (!this.editingCommentText.trim()) return;

    this.service.editComment(c.id, this.editingCommentText).subscribe(() => {
      c.text = this.editingCommentText;
      this.editingCommentId = null;
      this.editingCommentText = "";
      this.loadComments();
    });
  }
  cancelEdit() {
    this.editingCommentId = null;
    this.editingCommentText = "";
  }

  get paginatedLessons(): Lesson[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLessons.slice(start, start + this.pageSize);
  }


  totalLessonPages(): number {
    return Math.ceil(this.lessons.length / this.pageSize);
  }

  get visiblePages(): number[] {

    const totalPages = this.totalLessonPages();
    const maxVisible = 4;

    let start = Math.max(this.currentPage - 1, 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }

  goFirst() {
    this.currentPage = 1;
  }

  goLast() {
    this.currentPage = this.totalLessonPages();
  }

  goPrev() {
    if (this.currentPage > 1) this.currentPage--;
  }

  goNext() {
    if (this.currentPage < this.totalLessonPages()) this.currentPage++;
  }

  searchLessons() {
    const term = this.search.toLowerCase();
    this.filteredLessons = this.lessons.filter(l => l.name.toLowerCase().includes(term));
    this.currentPage = 1; 
  }

  get lessonPages(): number[] {
    return Array.from({ length: this.totalLessonPages() }, (_, i) => i + 1);
  }
  
  downloadLessonFile(fileName: string) {
    this.http.get(`/api/admin/courses/lesson/download?fileName=${fileName}`, {
      responseType: 'blob' 
    }).subscribe(blob => {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  loadTest() {
    this.service.getCourseStatus(this.courseId).subscribe(course => {
      this.testPassed = course.completed;

      if (!this.testPassed) {
        this.service.getCourseTest(this.courseId).subscribe(res => {
          console.log("TEST:",res);
          if ((res as any).alreadyCompleted) {
            this.testPassed = true;
            this.test = null;
          } else {
            this.test = res;
          }
        });
      } else {
        this.test = null;
      }
    });
  }
  openTestConfirmModal() {
    if (!this.allLessonsCompleted) return;
    this.confirmTestModalOpen = true;
  }

  testStarted = false;
  timeLeft = 0;
  timerInterval: any;

  userAnswers: { [questionId: string]: string } = {};
  testFinished = false;
  correctAnswers = 0;
  passed = false;

  startTest() {
    if (!this.test) return;

    this.testStarted = true;
    this.testFinished = false;

    this.timeLeft = this.test.durationMinutes * 60;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeExpired();
      }
    }, 1000);
  }

  handleTimeExpired() {
    this.timeExpired = true;

    Swal.fire({
      icon: 'warning',
      title: 'Time is up!',
      text: 'Test time has expired.',
      confirmButtonText: 'OK'
    }).then(() => {
      this.submitTest();
    });
  }

  totalQuestions = 0;
  submitTest() {
    if (!this.test || this.testFinished) 
      return;

    if (!this.test) 
      return;

    clearInterval(this.timerInterval);

    this.service
      .submitTest(this.test.testId, this.userAnswers)
      .subscribe(res => {
        this.correctAnswers = res.correct;
        this.passed = res.passed;
        this.testFinished = true;
        this.totalQuestions = this.test?.questions?.length || 0;

        if(res.passed)
        {
            this.testPassed = true;
            this.loadTest();
        }
      });
  }
  closeConfirmTestModal() {
    this.confirmTestModalOpen = false;
  }

  confirmStartTest() {
    this.confirmTestModalOpen = false;
    this.testModalOpen = true;
    this.startTest();
  }

  get minutes(): string{
    return Math.floor(this.timeLeft / 60).toString().padStart(2,'0');
  }

  get seconds(): string{
    return (this.timeLeft % 60).toString().padStart(2,'0');
  }

  closeTestModal() {
    this.testModalOpen = false;
    this.testStarted = false;
    this.testFinished = false;
    this.userAnswers = {};
    this.timeExpired = false;
    clearInterval(this.timerInterval);
  }

}