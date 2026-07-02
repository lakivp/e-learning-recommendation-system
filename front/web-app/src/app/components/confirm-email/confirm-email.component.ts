import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {

  loading = true;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading = false;
      Swal.fire('Error', 'Invalid confirmation link', 'error');
      return;
    }

    this.auth.confirmEmail(token).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        Swal.fire(
          'Success',
          'Your email has been successfully confirmed!',
          'success'
        );
      },
      error: (err) => {
        this.loading = false;

        Swal.fire(
          'Error',
          err?.error?.message || 'Confirmation failed',
          'error'
        );
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}