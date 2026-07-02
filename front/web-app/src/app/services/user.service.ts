import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = "http://localhost:5188/api/users";

  constructor(private http: HttpClient) {}

  getUsers(){
    return this.http.get<any[]>(this.api,{withCredentials: true});
  }

  toggleUser(id:string){
    return this.http.put(`${this.api}/toggle/${id}`,{}, {withCredentials: true});
  }

  changeUserRole(userId: string, role: string) {
    return this.http.put(`${this.api}/change-role`,
      { userId, role },
      { withCredentials: true }
    );
  }

}