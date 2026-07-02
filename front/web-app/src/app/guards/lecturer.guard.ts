import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const LecturerGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http
    .get<{ role: string }>('http://localhost:5188/api/auth/me', {
      withCredentials: true
    })
    .pipe(
      map(res => {
        if (!res || !res.role) {
          router.navigate(['/login'], { replaceUrl: true });
          return false;
        }

        if (res.role === 'Admin') {
          router.navigate(['/admin/adminDashboard'], { replaceUrl: true });
          return false;
        }

        if (res.role === 'User') {
          router.navigate(['/user/userDashboard'], { replaceUrl: true });
          return false;
        }

        if (res.role === 'Lecturer') {
          return true; 
        }

        router.navigate(['/login'], { replaceUrl: true });
        return false;
      }),
      catchError(() => {
        router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
};