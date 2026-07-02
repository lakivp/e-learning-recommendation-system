import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { LecturerGuard } from './guards/lecturer.guard';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { UserLayoutComponent } from './components/user-layout/user-layout.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AdminCoursesComponent } from './components/admin-courses/admin-courses.component';
import { AdminCourseViewComponent } from './components/admin-course-view/admin-course-view.component';
import { BrowseCoursesComponent } from './components/browse-courses/browse-courses.component';
import { AdminEnrollmentsComponent } from './components/admin-enrollments/admin-enrollments.component';
import { MyCoursesComponent } from './components/my-courses/my-courses.component';
import { CourseLessonsComponent } from './components/course-lessons/course-lessons.component';
import { UserProgressComponent } from './components/user-progress/user-progress.component';
import { AdminUsersActivityComponent } from './components/admin-users-activity/admin-users-activity.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { LecturerLayoutComponent } from './components/lecturer-layout/lecturer-layout.component';
import { LecturerDashboardComponent } from './components/lecturer-dashboard/lecturer-dashboard.component';
import { LecturerProfileComponent } from './components/lecturer-profile/lecturer-profile.component';
import { LecturerCoursesComponent } from './components/lecturer-courses/lecturer-courses.component';
import { LecturerCourseViewComponent } from './components/lecturer-course-view/lecturer-course-view.component';
import { RecommendedCoursesComponent } from './components/recommended-courses/recommended-courses.component';
import { AdminLecturerRequestsComponent } from './components/admin-lecturer-requests/admin-lecturer-requests.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path:'admin',
    component:AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children:
    [
      {
        path: '',
        redirectTo: 'adminDashboard',
        pathMatch: 'full'
      },

      {
        path: 'adminDashboard',
        component: AdminDashboardComponent
      },
      {
        path:'users',
        component: AdminUsersComponent
      },
      {
        path:'courses',
        component: AdminCoursesComponent,        
      },
      {
        path:'courses/:id',
        component: AdminCourseViewComponent
      },
      {
        path:'enrollments',
        component: AdminEnrollmentsComponent
      },
      {
        path:'users-activity',
        component: AdminUsersActivityComponent
      },
      {
        path:'lecturer-requests',
        component: AdminLecturerRequestsComponent
      }
  ]
  },

  {
    path:'user',
    component:UserLayoutComponent,
    canActivate: [AuthGuard, UserGuard],
    children:
    [
      {
        path: '',
        redirectTo: 'userDashboard',
        pathMatch: 'full'
      },

      {
        path: 'userDashboard',
        component: UserDashboardComponent
      },
      {
        path:'profile',
        component: UserProfileComponent
      },
      {
        path:'browse-courses',
        component: BrowseCoursesComponent
      },
      {
        path:'my-courses',
        component: MyCoursesComponent
      },
      {
        path:'courses/:id',
        component: CourseLessonsComponent
      },
      {
        path:'my-progress',
        component: UserProgressComponent
      },
      {
        path:'recommendedForYou',
        component:RecommendedCoursesComponent
      }
  ]
  },
  {

    path:'lecturer',
    component:LecturerLayoutComponent,
    canActivate: [AuthGuard, LecturerGuard],
    children:
    [
      {
        path:'lecturerDashboard',
        component:LecturerDashboardComponent
      },
      {
        path:'profile',
        component:LecturerProfileComponent
      },
      {
        path:'courses',
        component:LecturerCoursesComponent
      },
      {
        path:'courses/:id',
        component: LecturerCourseViewComponent
      },
    ]

  },

  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];