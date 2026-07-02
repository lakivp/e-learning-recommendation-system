import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  token = "";
  password = "";
  confirmPassword = "";
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get("token") || "";

    if (!this.token) {
      Swal.fire("Error", "Reset token is missing", "error").then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  reset() {

    if (!this.password || !this.confirmPassword) {
      Swal.fire("Error", "Please fill in both password fields", "error");
      return;
    }

    if (this.password.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters long", "error");
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => { 
        this.loading = false;

        // Token je sada u HttpOnly cookie, nema potrebe da ga čuvamo
        Swal.fire("Success", "Password changed successfully", "success").then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || "Invalid or expired token";
        Swal.fire("Error", message, "error");
      }
    });

  }

}