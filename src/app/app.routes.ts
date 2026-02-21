import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { PersonalListComponent } from './components/personal/personal-list/personal-list';
import { PersonalFormComponent } from './components/personal/personal-form/personal-form';
import { LicenciasListComponent } from './components/licencias/licencias-list/licencias-list';
import { LicenciasFormComponent } from './components/licencias/licencias-form/licencias-form';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
  { 
    path: 'home', 
    component: MainLayoutComponent,
    children: [     
      { path: 'personal', component: PersonalListComponent },
      { path: 'personal/nuevo', component: PersonalFormComponent },
      { path: 'personal/editar/:id', component: PersonalFormComponent },      
      { path: 'licencias', component: LicenciasListComponent },
      { path: 'licencias/nuevo', component: LicenciasFormComponent },
      { path: '', redirectTo: 'personal', pathMatch: 'full' } 
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }

];
