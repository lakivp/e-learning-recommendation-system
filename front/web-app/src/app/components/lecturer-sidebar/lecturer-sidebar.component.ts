import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lecturer-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecturer-sidebar.component.html',
  styleUrl: './lecturer-sidebar.component.css'
})
export class LecturerSidebarComponent {

  collapsed = false;

  constructor(private router:Router, private http:HttpClient){}
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

   private api = 'http://localhost:5188/api';

  logout() {
    this.http.post(
      `${this.api}/auth/logout`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
  navigate(path: string) {
    this.router.navigate([path]);
  }
}
