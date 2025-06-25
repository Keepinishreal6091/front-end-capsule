import { Routes } from '@angular/router';
import { CapsuleListComponent } from './components/capsule-list/capsule-list.component';
import { CapsuleCreateComponent } from './components/capsule-create/capsule-create.component';
import { CapsuleDetailComponent } from './capsule-detail/capsule-detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './pages/landing.component';


export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: CapsuleListComponent },
  { path: 'create', component: CapsuleCreateComponent },
   { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
  { path: 'capsules/:id', component: CapsuleDetailComponent }
  ];
