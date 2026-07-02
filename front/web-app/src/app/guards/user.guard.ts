import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const UserGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ role: string }>('http://localhost:5188/api/auth/me', { withCredentials: true })
    .pipe(
      map(res => {
        if (!res || res.role === undefined) {
          // Ako nema response ili role, redirect na login
          router.navigate(['/login'], { replaceUrl: true });
          return false;
        }

        if (res.role === 'Admin') {
          // Ako je admin, ne sme da uđe na user stranu
          router.navigate(['/admin/adminDashboard'], { replaceUrl: true });
          return false;
        }

        else if(res.role === 'Lecturer')
        {
            router.navigate(['/lecturer/lecturerDashboard'], { replaceUrl: true });
            return false;
        }
        // Ako je user (nije admin ili lecturer), dozvoli pristup
        return true;
      }),
      catchError(() => {
        // Ako backend vrati 401 (nije ulogovan)
        router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
};