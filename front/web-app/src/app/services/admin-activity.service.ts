import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityDto{
  type: string;
  text: string;
  date :string;
}

export interface RecentActivityResponse{
  stats: any;
  continueLearning: any[];
  recentActivity: ActivityDto[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminActivityService {

  private baseUrl = 'http://localhost:5188/api/admin/activity';

  constructor(private http: HttpClient) {}

  // lista svih korisnika
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`,{withCredentials:true});
  }

  // heatmap za konkretnog korisnika
  getUserHeatmap(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/heatmap/${userId}`,{withCredentials:true});
  }

  getUserRecentActivity(userId: string): Observable<RecentActivityResponse> {
    return this.http.get<RecentActivityResponse>(`${this.baseUrl}/recent/${userId}`,{withCredentials:true});
  }
}