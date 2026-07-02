import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LecturerSidebarComponent } from '../lecturer-sidebar/lecturer-sidebar.component';
@Component({
  selector: 'app-lecturer-layout',
  standalone: true,
  imports: [RouterOutlet,LecturerSidebarComponent],
  templateUrl: './lecturer-layout.component.html',
  styleUrl: './lecturer-layout.component.css'
})
export class LecturerLayoutComponent {

}
