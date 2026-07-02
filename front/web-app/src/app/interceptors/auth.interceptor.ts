import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  req = req.clone({ withCredentials: true });

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout().subscribe({
          next: () => {
            router.navigate(['/login'], { replaceUrl: true });
          },
          error: () => {
            router.navigate(['/login'], { replaceUrl: true });
          }
        });
      }
      return throwError(() => err);
    })
  );
};