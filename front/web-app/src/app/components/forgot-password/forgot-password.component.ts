import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  email = "";
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  sendReset() {
    if (!this.email) {
      Swal.fire("Error", "Enter email", "error");
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        Swal.fire("Success", res.message || "Reset link sent to your email", "success");
        this.email = "";
      },
      error: (err) => {
        this.loading = false;

        const msg = err.error?.message || "Unexpected error";

        Swal.fire("Error", msg, "error");
      }
    });
  }

  goToLogin(){
    this.router.navigate(['/login']);
  }
}