import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {

  private api = 'http://localhost:5188/api/user/dashboard';
  constructor(private http: HttpClient) { }

  getDashboard() {
    return this.http.get<any>(this.api,{withCredentials:true});
  }

  getCalendar(year:number, month:number, type:'enroll' | 'lesson'){
    return this.http.get<any[]>(`${this.api}/calendar?year=${year}&month=${month}&type=${type}`,{withCredentials:true});
  }
  
}
