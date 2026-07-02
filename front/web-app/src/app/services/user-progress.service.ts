import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface DayActivity {
  type: 'enroll' | 'lesson' | 'course' | 'comment';
  text: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private api = 'http://localhost:5188/api/user/progress';

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<any>(`${this.api}/summary`,{withCredentials: true});
  }

  getHeatmap() {
    return this.http.get<any[]>(`${this.api}/heatmap`,{withCredentials: true});
  }

  getChart() {
    return this.http.get<any[]>(`${this.api}/chart`,{withCredentials: true});
  }
   getActivitiesByDay(date: string): Observable<DayActivity[]> {
    return this.http.get<DayActivity[]>(
      `${this.api}/activities-by-day?date=${date}`,{withCredentials:true}
    );
  }
}