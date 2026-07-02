import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ role: string }>('http://localhost:5188/api/auth/me', { withCredentials: true })
    .pipe(
      map(res => {
        // Ako backend ne vrati role, znači da korisnik nije validno ulogovan
        if (!res || !res.role) {
          router.navigate(['/login'], { replaceUrl: true });
          return false;
        }
        // Ako je ulogovan (bilo koji role), dozvoli pristup
        return true;
      }),
      catchError(() => {
        // Ako backend vrati 401 ili neku grešku → redirect na login
        router.navigate(['/login'], { replaceUrl: true });
        return of(false);
      })
    );
};