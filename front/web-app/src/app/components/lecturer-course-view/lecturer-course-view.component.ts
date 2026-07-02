import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { CourseComment, LecturerCourseService } from '../../services/lecturer-course.service';
import { Lesson, Course } from '../../services/course.service';
import { LecturerTestService, CourseTest, TestQuestion, CreateTestDto } from '../../services/lecturer-test.service';


@Component({
  selector: 'app-lecturer-course-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-course-view.component.html',
  styleUrl: './lecturer-course-view.component.css'
})
export class LecturerCourseViewComponent implements OnInit {

  searchText = '';
  courseId!: string;

  lessons: Lesson[] = [];
  allLessons: Lesson[] = [];
  pagedLessons: Lesson[] = [];

  comments: CourseComment[] = [];
  pagedComments: CourseComment[] = [];

  currentPage = 1;
  pageSize = 12;

  commentsCurrentPage = 1;
  commentsPageSize = 5;

  addingLesson = false;
  editingLesson: Lesson | null = null;

  newLesson = {
    name: '',
    text: ''
  };

  selectedFile: File | null = null;
  editingSelectedFile: File | null = null;

  dragActive = false;
  editingDragActive = false;
  loading = false;

  textModalOpen = false;
  textModalLesson: Lesson | null = null;

  test: CourseTest | null = null;
  showTestForm = false;

  showCreateTestModal = false;

  newQuestion: TestQuestion = {
    text: '',
    options: ['',''],
    correctIndex: 0
  };

  newTest: CreateTestDto = {
    courseId: this.courseId,
    title: '',
    durationMinutes: null,
    questions: [],
    requiredCorrect: null
  }

  constructor(
    private route: ActivatedRoute,
    private lecturerService: LecturerCourseService,
    private http: HttpClient,
    private lecturerTestService: LecturerTestService,
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadLessons();
    this.loadComments();
    this.newTest.courseId = this.courseId;
    this.loadTest();
  }

  /* ===================== LESSONS ===================== */

  loadLessons() {
    this.loading = true;
    this.lecturerService.getCourse(this.courseId).subscribe({
      next: (course: Course) => {
        this.lessons = course.lessons;
        this.allLessons = [...course.lessons];
        this.updatePagedLessons();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  saveLesson() {
    const form = new FormData();
    form.append('courseId', this.courseId);
    form.append('name', this.newLesson.name);
    form.append('text', this.newLesson.text || '');
    if (this.selectedFile) form.append('file', this.selectedFile);

    this.loading = true;

    this.lecturerService.addLessonWithFile(form).subscribe({
      next: () => {
        this.loadLessons();
        this.closeAddModal();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteLesson(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this lesson?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',   
      cancelButtonColor: '#9ca3af',    
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {
        this.lecturerService.deleteLesson(this.courseId, id).subscribe(() => {
          this.loadLessons();

          Swal.fire({
            title: 'Deleted!',
            text: 'The lesson has been successfully removed.',
            icon: 'success',
            confirmButtonColor: '#2563eb'  
          });
        });
      }

    });
  }

  saveEdit() {
    if (!this.editingLesson) return;

    this.loading = true;

    this.lecturerService.updateLesson(this.courseId, this.editingLesson).subscribe(() => {
      if (this.editingSelectedFile) {
        this.lecturerService
          .uploadLessonFile(this.courseId, this.editingLesson!.id, this.editingSelectedFile)
          .subscribe(() => {
            this.finishEdit();
          });
      } else {
        this.finishEdit();
      }
    });
  }

  finishEdit() {
    this.loadLessons();
    this.editingLesson = null;
    this.editingSelectedFile = null;
    this.loading = false;
  }

  /* ===================== COMMENTS ===================== */

  loadComments() {
    this.lecturerService.getComments(this.courseId).subscribe(res => {
      this.comments = res;
      this.updatePagedComments();
    });
  }

  deleteComment(id: string) {
    this.lecturerService.deleteComment(id).subscribe(() => {
      this.loadComments();
    });
  }

  /* ===================== PAGINATION ===================== */

  updatePagedLessons() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedLessons = this.lessons.slice(start, start + this.pageSize);
  }

  updatePagedComments() {
    const start = (this.commentsCurrentPage - 1) * this.commentsPageSize;
    this.pagedComments = this.comments.slice(start, start + this.commentsPageSize);
  }

  /* ===================== UI HELPERS ===================== */

  filterLessons() {
    const term = this.searchText.toLowerCase();
    this.lessons = this.allLessons.filter(l =>
      l.name.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.updatePagedLessons();
  }

  openAddModal() {
    this.addingLesson = true;
  }

  closeAddModal() {
    this.addingLesson = false;
    this.newLesson = { name: '', text: '' };
    this.selectedFile = null;
  }

  openEditModal(lesson: Lesson) {
    this.editingLesson = { ...lesson };
  }

  cancelEditModal() {
    this.editingLesson = null;
    this.editingSelectedFile = null;
    this.editingDragActive = false;
  }

  openTextModal(lesson: Lesson) {
    this.textModalLesson = lesson;
    this.textModalOpen = true;
  }

  closeTextModal() {
    this.textModalLesson = null;
    this.textModalOpen = false;
  }

  /* ===================== FILE ===================== */

  onFileSelected(e: any) {
    this.selectedFile = e.target.files[0];
  }

  onEditFileSelected(e: any) {
    this.editingSelectedFile = e.target.files[0];
  }

  downloadLessonFile(fileName: string) {
    this.http.get(`/api/lecturer/courses/lesson/download?fileName=${fileName}`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  totalLessonPages(): number {
    return Math.ceil(this.lessons.length / this.pageSize);
  }

  get visiblePages(): number[] {
    return Array.from({ length: this.totalLessonPages() }, (_, i) => i + 1);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updatePagedLessons();
  }

  goFirst() {
    this.currentPage = 1;
    this.updatePagedLessons();
  }

  goLast() {
    this.currentPage = this.totalLessonPages();
    this.updatePagedLessons();
  }

  goPrev() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedLessons();
    }
  }

  goNext() {
    if (this.currentPage < this.totalLessonPages()) {
      this.currentPage++;
      this.updatePagedLessons();
    }
  }

  totalCommentPages(): number {
    return Math.ceil(this.comments.length / this.commentsPageSize);
  }

  get visiblePagesComm(): number[] {
    return Array.from({ length: this.totalCommentPages() }, (_, i) => i + 1);
  }

  changeCommentsPage(page: number) {
    this.commentsCurrentPage = page;
    this.updatePagedComments();
  }

  goCommentsFirst() {
    this.commentsCurrentPage = 1;
    this.updatePagedComments();
  }

  goCommentsLast() {
    this.commentsCurrentPage = this.totalCommentPages();
    this.updatePagedComments();
  }

  goCommentsPrev() {
    if (this.commentsCurrentPage > 1) {
      this.commentsCurrentPage--;
      this.updatePagedComments();
    }
  }

  goCommentsNext() {
    if (this.commentsCurrentPage < this.totalCommentPages()) {
      this.commentsCurrentPage++;
      this.updatePagedComments();
    }
  }


  getFileName(path: string): string {
    return path.split('/').pop() || '';
  }

  getFileIcon(path?: string) {

    if (!path) return 'fa-file';

    if (path.endsWith('.pdf')) return 'fa-file-pdf';
    if (path.endsWith('.ppt') || path.endsWith('.pptx')) return 'fa-file-powerpoint';
    if (path.endsWith('.doc') || path.endsWith('.docx')) return 'fa-file-word';

    return 'fa-file';
  }

  deleteLessonFile() {
    if (!this.editingLesson) return;

    this.loading = true;

    this.lecturerService.deleteLessonFile(this.courseId, this.editingLesson.id)
      .subscribe(() => {
        // ukloni fajl iz frontend varijable
        this.editingLesson!.filePath = undefined;
        this.editingSelectedFile = null;
        this.loading = false;
      }, err => {
        console.error('Delete file failed', err);
        this.loading = false;
      });
  }

  onEditDrop(event: DragEvent) {
    event.preventDefault();
    this.editingDragActive = false;

    if (event.dataTransfer?.files.length) {
      this.editingSelectedFile = event.dataTransfer.files[0];
    }
  }

  onEditDragOver(event: DragEvent) {
    event.preventDefault();
    this.editingDragActive = true;
  }

  onEditDragLeave() {
    this.editingDragActive = false;
  }

  onDragLeave() {
    this.dragActive = false;
  }

  onDrop(event: DragEvent) {

    event.preventDefault();
    this.dragActive = false;

    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive = true;
  }

  loadTest() {
      this.lecturerTestService.getTest(this.courseId).subscribe(res => {
      this.test = res;
    });
  }


  addQuestion() {
    if (!this.test) return;

    const question: TestQuestion = {
      text: this.newQuestion.text,
      options: [...this.newQuestion.options],
      correctIndex: this.newQuestion.correctIndex
    };

    this.lecturerTestService
      .addQuestion(this.test.id!, question)
      .subscribe(() => {
        this.loadTest();
        this.newQuestion = {
          text: '',
          options: ['', ''],
          correctIndex: 0
        };
      });
  }

  deleteQuestion(id: string) {
    if (!this.test) return;

    this.lecturerTestService
      .deleteQuestion(this.test.id!, id)
      .subscribe(() => this.loadTest());
  }

  openCreateTestModal() {
    this.showCreateTestModal = true;
  }

  closeCreateTestModal() {
    this.showCreateTestModal = false;
    this.newTest = {
      courseId: this.courseId,
      title: '',
      durationMinutes: null,
      questions: [],
      requiredCorrect: null
    };
    this.newQuestion = {
      text: '',
      options: ['', ''],
      correctIndex: 0
    };
  }

  saveTest() {

    if (this.newTest.requiredCorrect !== null && (this.newTest.requiredCorrect < 1 || this.newTest.requiredCorrect > this.newTest.questions.length)) 
    {
        Swal.fire(
          'Error',
          'Required correct answers must be between 1 and number of questions',
          'error'
        );
        return;
    }

    if (!this.newTest.durationMinutes || this.newTest.durationMinutes <= 0) {
      Swal.fire(
        'Error',
        'Test duration must be greater than 0 minutes',
        'error'
      );
      return;
    }

    if (this.isEditingTest && this.test?.id) {

      const dto: CreateTestDto = {
        courseId: this.courseId,
        title: this.newTest.title,
        durationMinutes: this.newTest.durationMinutes,
        questions: this.newTest.questions,
        requiredCorrect: this.newTest.requiredCorrect
      };

      this.lecturerTestService
        .updateTest(this.test.id, dto)
        .subscribe(() => {
          this.loadTest();
          this.closeCreateTestModal();
          this.isEditingTest = false;
        });

      return;
    }

    // CREATE
    this.lecturerTestService.createTest(this.newTest).subscribe(t => {
      this.test = t;
      this.closeCreateTestModal();
    });
  }

  addQuestionToNewTest() {

    if (!this.newQuestion.text.trim()) {
      Swal.fire('Error', 'Question text is required', 'error');
      return;
    }

    const optionsWithIndex = this.newQuestion.options
      .map((o, i) => ({ text: o.trim(), index: i }))
      .filter(o => o.text);

    if (optionsWithIndex.length < 2) {
      Swal.fire('Error', 'At least 2 answers are required', 'error');
      return;
    }

    const correctOption = optionsWithIndex.find(
      o => o.index === this.newQuestion.correctIndex
    );

    if (!correctOption) {
      Swal.fire('Error', 'Correct answer must be one of the filled answers', 'error');
      return;
    }

    this.newTest.questions.push({
      text: this.newQuestion.text,
      options: optionsWithIndex.map(o => o.text),
      correctIndex: optionsWithIndex.indexOf(correctOption)
    });

    this.newQuestion = {
      text: '',
      options: ['', ''],
      correctIndex: 0
    };
  }
  removeQuestion(index: number) {
    this.newTest.questions.splice(index, 1);
  }

  addOption() {
    this.newQuestion.options.push('');
  }

  removeOption(index: number) {
    this.newQuestion.options.splice(index, 1);

    if (this.newQuestion.correctIndex === index) {
      this.newQuestion.correctIndex = 0;
    }

    if (this.newQuestion.correctIndex > index) {
      this.newQuestion.correctIndex--;
    }
  }

  showPreviewTestModal = false;
  openPreviewTestModal() {
    this.showPreviewTestModal = true;
  }

  closePreviewTestModal() {
    this.showPreviewTestModal = false;
  }

  isEditingTest = false;

  openEditTestModal() {
    if (!this.test) return;

    this.isEditingTest = true;

    this.newTest = {
      courseId: this.courseId,
      title: this.test.title,
      durationMinutes: this.test.durationMinutes,
      questions: JSON.parse(JSON.stringify(this.test.questions)),
      requiredCorrect: Math.round(
        (this.test.passPercentage! / 100) * this.test.questions.length
      )
    };

    this.showCreateTestModal = true;
  }

  deleteTest() {
    if (!this.test) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this test?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',   
      cancelButtonColor: '#9ca3af',    
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {
        this.lecturerTestService
          .deleteTest(this.test!.id!)
          .subscribe(() => {
            this.test = null;

            Swal.fire({
              title: 'Deleted!',
              text: 'The test has been successfully removed.',
              icon: 'success',
              confirmButtonColor: '#2563eb' 
            });
          });
      }

    });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

}