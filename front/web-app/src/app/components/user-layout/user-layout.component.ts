import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserSidebarComponent } from '../user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [UserSidebarComponent, RouterOutlet],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css'
})
export class UserLayoutComponent {

}
