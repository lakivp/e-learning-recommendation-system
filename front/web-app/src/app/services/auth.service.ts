import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  role: string; // Admin ili User
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:5188/api';

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }) {
    return this.http.post(
      `${this.api}/auth/login`,
      data, {withCredentials: true}
    );
  }

  logout() {
    return this.http.post(
      `${this.api}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  register(data: any) {
    return this.http.post(
      `${this.api}/auth/register`,
      data
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.api}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.api}/auth/reset-password`, {
      token,
      newPassword
    });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put(
      `${this.api}/auth/change-password`,
      { oldPassword, newPassword },
      { withCredentials: true }
    );
  }

  getProfile(): Observable<{ userId: string; role: string }> {
    return this.http.get<{ userId: string; role: string }>(
      `${this.api}/auth/me`,{withCredentials:true});
  }

  confirmEmail(token:string){
    return this.http.post(`${this.api}/auth/confirm-email`,{token});
  }
}