import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/login/login').then((m) => m.Login) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'pacientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pacientes/lista-pacientes/lista-pacientes').then((m) => m.ListaPacientes),
  },
  {
    path: 'pacientes/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pacientes/form-paciente/form-paciente').then((m) => m.FormPaciente),
  },
  {
    path: 'pacientes/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pacientes/form-paciente/form-paciente').then((m) => m.FormPaciente),
  },
];