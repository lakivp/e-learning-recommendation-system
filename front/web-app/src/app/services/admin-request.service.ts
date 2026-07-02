import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminRequestService {

 private api = 'http://localhost:5188/api/admin';

  constructor(private http: HttpClient) {}

  getLecturerRequests() {
    return this.http.get<any[]>(`${this.api}/lecturer-requests`);
  }

  approveLecturer(userId: string) {
    return this.http.post(`${this.api}/lecturer-requests/${userId}/approve`, {});
  }

  rejectLecturer(userId: string) {
    return this.http.post(`${this.api}/lecturer-requests/${userId}/reject`, {});
  }

}
