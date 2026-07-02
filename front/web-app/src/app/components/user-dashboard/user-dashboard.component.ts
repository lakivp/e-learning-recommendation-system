import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardService } from '../../services/user-dashboard.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-dashboard',
  standalone:true,
  imports:[CommonModule, FormsModule],
  templateUrl:'./user-dashboard.component.html',
  styleUrls:['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit{

  stats:any;
  recentActivity:any[]=[];
  continueLearning:any;

  constructor(private service:UserDashboardService){}

  ngOnInit(){
    this.service.getDashboard().subscribe(res=>{
      this.stats = res.stats;
      this.recentActivity = res.recentActivity;

      this.continueLearning = res.continueLearning;
    });
  }

  icon(type:string){
    switch(type){
      case 'enroll': return '📘';
      case 'lesson': return '✅';
      case 'course': return '🎓';
      case 'test': return '📝';
      case 'comment': return '💬';
      default: return '•';
    }
  }

}