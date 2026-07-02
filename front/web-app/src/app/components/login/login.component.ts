import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.username || !this.password) {
      Swal.fire('Error', 'Please enter username and password', 'error');
      return;
    }

    this.loading = true;

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: () => {
        this.auth.getProfile().subscribe({
          next: (profile) => {
            this.loading = false;

            if (profile.role === 'Admin') {
              this.router.navigate(['/admin/adminDashboard']);
            } else {
              this.router.navigate(['/user/userDashboard']);
            }
          },
          error: () => {
            this.loading = false;
            Swal.fire('Error', 'Unable to load user profile', 'error');
          }
        });
      },
      error: (err) => {
        this.loading = false;

        const msg =
          err?.error?.message ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Login failed';

        Swal.fire('Error', msg, 'error');
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgot() {
    this.router.navigate(['/forgot-password']);
  }
}