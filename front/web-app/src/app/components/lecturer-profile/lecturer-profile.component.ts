import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lecturer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-profile.component.html',
  styleUrl: './lecturer-profile.component.css'
})
export class LecturerProfileComponent implements OnInit {

  profile: any = {};
    edit = false;
    loading = false;
  
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';
    editPassword = false;
    originalProfile: any = {};
  
    constructor(
      private profileService: ProfileService,
      private auth: AuthService
    ) {}
  
    ngOnInit() {
      this.auth.getProfile().subscribe({
        next: (res) => {
          const userId = res.userId;
          if (!userId) {
            Swal.fire('Error', 'User not found. Please login again.', 'error');
            return;
          }
  
          this.profileService.getProfile(userId).subscribe({
            next: profile => {
              this.profile = { ...profile };
              this.originalProfile = { ...profile }; // čuvamo original
            },
            error: err => {
              console.error(err);
              Swal.fire('Error', 'Failed to load profile', 'error');
            }
          });
        },
        error: err => {
          Swal.fire('Error', 'Not authenticated', 'error');
        }
      });
    }
  
    toggleEdit() {
      this.edit = !this.edit;
    }
  
    save() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.profile.email)) {
        Swal.fire('Error', 'Please enter a valid email address.', 'error');
        return;
      }
  
      this.loading = true;
      this.profileService.updateProfile(this.profile.id, this.profile).subscribe({
        next: () => {
          this.loading = false;
          this.edit = false;
          this.originalProfile = { ...this.profile };
          Swal.fire('Success', 'Profile updated successfully', 'success');
        },
        error: err => {
          this.loading = false;
          Swal.fire('Error', err.error?.message || 'An unexpected error occurred.', 'error');
        }
      });
    }
  
    changePassword() {
      if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
        Swal.fire('Error', 'All password fields are required', 'error');
        return;
      }
  
      if (this.newPassword !== this.confirmPassword) {
        Swal.fire('Error', 'New passwords do not match', 'error');
        return;
      }
  
      this.loading = true;
      this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Password changed successfully', 'success');
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.editPassword = false;
        },
        error: err => {
          this.loading = false;
          Swal.fire('Error', err.error?.message || 'Unexpected error', 'error');
        }
      });
    }

    cancelEdit() {
      this.profile = { ...this.originalProfile }; 
      this.edit = false; 
    }
}
