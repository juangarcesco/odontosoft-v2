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
  {
    path: 'pacientes/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pacientes/detalle-paciente/detalle-paciente').then(
        (m) => m.DetallePaciente,
      ),
  },
  {
    path: 'citas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/citas/agenda/agenda').then((m) => m.Agenda),
  },

  {
    path: 'citas/nueva',
    canActivate: [authGuard],
    loadComponent: () => import('./features/citas/form-cita/form-cita').then((m) => m.FormCita),
  },
  {
    path: 'citas/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/citas/form-cita/form-cita').then((m) => m.FormCita),
  },

  {
    path: 'pacientes/:pacienteId/historia-clinica',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/historia-clinica/vista-historia/vista-historia').then(
        (m) => m.VistaHistoria,
      ),
  },

  {
    path: 'pacientes/:pacienteId/facturacion/nueva',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/facturacion/form-factura/form-factura').then((m) => m.FormFactura),
  },

  {
    path: 'pacientes/:pacienteId/facturacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/facturacion/lista-facturas/lista-facturas').then((m) => m.ListaFacturas),
  },

  {
    path: 'inventario',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventario/lista-materiales/lista-materiales').then(
        (m) => m.ListaMateriales,
      ),
  },

  {
    path: 'inventario/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventario/form-material/form-material').then((m) => m.FormMaterial),
  },
  {
    path: 'inventario/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inventario/form-material/form-material').then((m) => m.FormMaterial),
  },

  {
  path: 'inventario/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/inventario/detalle-material/detalle-material').then((m) => m.DetalleMaterial),
},
];
