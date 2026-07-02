import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name = "";
  surname = "";
  username = "";
  email = "";
  password = "";
  wantsToBeLecturer = false;
  loading = false;
  constructor(private auth: AuthService,private router:Router) { }

  register() {

    if(!this.name || !this.surname || !this.username || !this.email || !this.password)
    {
      Swal.fire('Error','Please fill in all fields','error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(this.email))
    {
       Swal.fire('Error','Email adress is not valid','error');
      return;
    }

    this.loading = true;
    this.auth.register({
      name: this.name,
      surname: this.surname,
      username: this.username,
      email: this.email,
      password: this.password,
      wantsToBeLecturer: this.wantsToBeLecturer
    }).subscribe({
      next: (res:any) => {
        this.loading = false;
        Swal.fire("Success", "Account created. Please check your email and confirm your account before logging in.", "success");
        this.name = "";
        this.surname = "";
        this.username = "";
        this.email = "";
        this.password = "";

        setTimeout(()=>{
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;

        let msg = 'An unexpected error occurred';

      
        if (err.error && typeof err.error === 'object' && 'message' in err.error) {
          msg = err.error.message;
        } 
        
        else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            if ('message' in parsed) {
              msg = parsed.message;
            } else {
              msg = parsed; 
            }
          } catch {
            msg = err.error; 
          }
        }

        Swal.fire('Error', msg, 'error');
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}