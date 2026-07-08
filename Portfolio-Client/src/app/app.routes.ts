import { Routes } from '@angular/router';
import { ChooserComponent } from './components/chooser/chooser.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: ChooserComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: ':slug', component: ProfilePageComponent },
  { path: '**', redirectTo: '' }
];
