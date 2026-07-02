import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'user-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.css'
})
export class UserSidebarComponent {

  collapsed = false;

  constructor(private router:Router,private http:HttpClient){}
  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  //  logout() {
  //   localStorage.clear();
  //   this.router.navigate(["/login"]);
  // }
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
