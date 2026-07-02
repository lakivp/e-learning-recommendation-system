import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  users:any[] = [];
  filteredUsers:any[] = [];
  roleFilter:string = 'All';

  searchTerm:string = "";

  page = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(private userService:UserService){}

  ngOnInit(){
    this.loadUsers();
  }

  loadUsers(){
    this.userService.getUsers().subscribe(res=>{
      this.users = res;
      this.applyFilters();
      this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    })
  }

  toggle(user:any){
    this.userService.toggleUser(user.id).subscribe(()=>{
      user.isActive = !user.isActive;
    })
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();

    this.filteredUsers = this.users.filter(u => {

      const matchesSearch =
        (u.name + " " + u.surname).toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term);

      const matchesRole =
        this.roleFilter === 'All' || u.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });

    this.page = 1;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
  }

    // Paginacija recent users
  get visiblePages(): number[] {
    const maxVisible = 4;
    let start = Math.max(1, this.page - 1);
    let end = start + maxVisible - 1;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  goToFirst() {
    this.page = 1;
  }

  goToLast() {
    this.page = this.totalPages;
  }

  setPage(p: number) {
    this.page = p;
  }

  get paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  changeRole(user: any, event: any) {
    const newRole = event.target.value;

    if (newRole === user.role) return;

    this.userService.changeUserRole(user.id, newRole)
      .subscribe({
        next: () => {
          user.role = newRole;
        },
        error: () => {
          event.target.value = user.role;
          alert('Role change failed');
        }
      });
  }

}