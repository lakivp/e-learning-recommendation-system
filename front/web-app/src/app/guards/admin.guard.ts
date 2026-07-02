import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const AdminGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ role: string }>('http://localhost:5188/api/auth/me', { withCredentials: true })
    .pipe(
      map(res => {
        if (!res || res.role !== 'Admin') {
          // Ako nije admin ili uopšte nema response
          router.navigate(['/login'], { replaceUrl: true });
          return false;
        }
        return true; // sve ok, admin
      }),
      catchError(() => {
        // Ako backend vrati 401 (user nije ulogovan)
        router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
};