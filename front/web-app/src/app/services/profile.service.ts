import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  private api="http://localhost:5188/api/profile";

  constructor(private http:HttpClient){}

  getProfile(id:string){
    return this.http.get(`${this.api}/${id}`, {withCredentials:true});
  }

  updateProfile(id:string,data:any){
    return this.http.put(`${this.api}/update/${id}`,data,{withCredentials:true});
  }

}