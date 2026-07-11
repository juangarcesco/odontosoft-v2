import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private authService = inject(AuthService);

  cerrarSesion(): void {
    this.authService.logout();
  }
}