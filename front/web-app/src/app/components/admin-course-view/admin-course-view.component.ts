import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService, Lesson, Comment } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminTestService } from '../../services/admin-test.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-course-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-course-view.component.html',
  styleUrl: './admin-course-view.component.css'
})
export class AdminCourseViewComponent implements OnInit {

  searchText:string = '';
  allLessons: Lesson[] = [];
  courseId!: string;
  textModalOpen = false;
  textModalLesson: Lesson | null = null;

  lessons: Lesson[] = [];
  pagedLessons: Lesson[] = [];

  comments: Comment[] = [];

  currentPage = 1;
  pageSize = 12;
  pages: number[] = [];

  addingLesson = false;
  editingLesson: Lesson | null = null;

  newLesson = {
    name: '',
    text: ''
  };

  selectedFile: File | null = null;
  dragActive = false;
  loading = false;

  test: any = null;
  showPreviewTestModal = false;

  commentsCurrentPage = 1;
  commentsPageSize = 5;
  commentsPages: number[] = [];
  pagedComments: Comment[] = [];

  editingSelectedFile: File | null = null;
  editingDragActive: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private http:HttpClient,
    private adminTestService: AdminTestService
  ) {}

  ngOnInit() {

    this.courseId = this.route.snapshot.paramMap.get('id')!;

    this.loadLessons();
    this.loadComments();
    this.loadTest();
  }

  loadLessons() {
    this.loading = true;
    this.courseService.getCourse(this.courseId)
      .subscribe(course => {
        this.loading = false;
        this.lessons = course.lessons;
        this.allLessons = [...course.lessons];
        this.setupPagination();
      });
  }

  loadComments() {
    this.courseService.getComments(this.courseId)
      .subscribe((res: Comment[]) => {
        this.comments = res;
        this.setupCommentsPagination();
      });
  }

  deleteComment(id: string) {
    this.courseService.deleteComment(id)
      .subscribe(() => this.loadComments());
  }

  setupPagination() {
    const total = Math.ceil(this.lessons.length / this.pageSize);
    this.updatePagedLessons();
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

  updatePagedLessons() {

    const start = (this.currentPage - 1) * this.pageSize;

    this.pagedLessons = this.lessons.slice(start, start + this.pageSize);
  }

  changePage(p: number) {

    this.currentPage = p;
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

  saveLesson() {
    this.loading = true;

    // Pripremamo FormData za backend
    const form = new FormData();
    form.append('courseId', this.courseId);
    form.append('name', this.newLesson.name);
    form.append('text', this.newLesson.text || '');
    if (this.selectedFile) 
      form.append('file', this.selectedFile);

    this.courseService.addLessonWithFile(form).subscribe({
      next: (lesson) => {
        // Kada se lekcija doda (sa fajlom ili bez fajla), učitaj sve lekcije i zatvori modal
        this.loadLessons();
        this.closeAddModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Add lesson failed', err);
        this.loading = false;
      }
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
        this.courseService
          .deleteLesson(this.courseId, id)
          .subscribe(() => {
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

  openEditModal(lesson: Lesson) {
    this.editingLesson = { ...lesson };
    this.editingSelectedFile = null;
  }

  closeEditModal() {
    this.editingLesson = null;
  }

  saveEdit() {
    if (!this.editingLesson) return;

    this.loading = true;

    this.courseService.updateLesson(this.courseId, this.editingLesson)
      .subscribe(() => {
        // Ako postoji novi fajl koji treba uploadovati
        if (this.editingSelectedFile) {
          this.courseService.uploadLessonFile(this.courseId, this.editingLesson!.id, this.editingSelectedFile)
            .subscribe({
              next: () => {
                this.loadLessons();
                this.closeEditModal();
                this.loading = false;
              },
              error: err => {
                console.error('Upload failed', err);
                this.loading = false;
              }
            });
        } else {
          // Nema novog fajla – update lekcije bez fajla
          this.loadLessons();
          this.closeEditModal();
          this.loading = false;
        }
      }, err => {
        console.error('Update lesson failed', err);
        this.loading = false;
      });
  }

  onFileSelected(event: any) {

    this.selectedFile = event.target.files[0];
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

  onDragLeave() {
    this.dragActive = false;
  }


  getFileIcon(path?: string) {

    if (!path) return 'fa-file';

    if (path.endsWith('.pdf')) return 'fa-file-pdf';
    if (path.endsWith('.ppt') || path.endsWith('.pptx')) return 'fa-file-powerpoint';
    if (path.endsWith('.doc') || path.endsWith('.docx')) return 'fa-file-word';

    return 'fa-file';
  }

  getFileName(path?: string):string{
    if(!path) return '';
      return path.split('/').pop()!;
  }

  filterLessons() {
    const term = this.searchText.toLowerCase();
    this.lessons = this.allLessons.filter(l => 
      l.name.toLowerCase().includes(term)
    );
    this.currentPage = 1;
    this.setupPagination();
  }

  openTextModal(lesson: Lesson) {
    this.textModalLesson = lesson;
    this.textModalOpen = true;
  }

  closeTextModal() {
    this.textModalOpen = false;
    this.textModalLesson = null;
  }

  setupCommentsPagination() {
    const total = Math.ceil(this.comments.length / this.commentsPageSize);
    this.updatePagedComments();
  }

  get visiblePagesComm(): number[] {

    const totalPages = Math.ceil(this.comments.length / this.commentsPageSize);;
    const maxVisible = 4;

    let start = Math.max(this.commentsCurrentPage - 1, 1);
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

  totalCommentPages(): number {
    return Math.ceil(this.comments.length / this.commentsPageSize);
  }

  updatePagedComments() {
    const start = (this.commentsCurrentPage - 1) * this.commentsPageSize;
    this.pagedComments = this.comments.slice(start, start + this.commentsPageSize);
  }

  changeCommentsPage(p: number) {
    this.commentsCurrentPage = p;
    this.updatePagedComments();
  }

  deleteLessonFile() {
    if (!this.editingLesson) return;

    this.loading = true;

    this.courseService.deleteLessonFile(this.courseId, this.editingLesson.id)
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

  onEditFileSelected(event: any) {
    if (event.target.files.length) {
      this.editingSelectedFile = event.target.files[0];
    }
  }

  totalLessonPages(): number {
    return Math.ceil(this.lessons.length / this.pageSize);
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
    if (this.currentPage > 1) this.currentPage--;
    this.updatePagedLessons();
  }

  goNext() {
    if (this.currentPage < this.totalLessonPages()) this.currentPage++;
    this.updatePagedLessons();
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
    if (this.commentsCurrentPage > 1) 
      this.commentsCurrentPage--;
    this.updatePagedComments();
  }

  goCommentsNext() {
    if (this.commentsCurrentPage < this.totalCommentPages()) 
      this.commentsCurrentPage++;
    this.updatePagedComments();
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

  cancelEditModal() {
    this.editingLesson = null;
    this.editingSelectedFile = null;
    this.editingDragActive = false;      
  }

  loadTest() {
    this.adminTestService
      .getTestByCourse(this.courseId)
      .subscribe({
        next: res => this.test = res,
        error: () => this.test = null
      });
  }

  openPreviewTestModal() {
    this.showPreviewTestModal = true;
  }

  closePreviewTestModal() {
    this.showPreviewTestModal = false;
  }

  deleteTest() {
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
        this.adminTestService
          .deleteTest(this.test.id)
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
  }