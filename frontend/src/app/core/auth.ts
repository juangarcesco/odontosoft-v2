import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: string;
  nombre: string;
  rol: 'ADMIN' | 'ODONTOLOGO' | 'RECEPCIONISTA';
}

interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'odontosoft_token';
  private readonly USUARIO_KEY = 'odontosoft_usuario';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((respuesta) => {
          localStorage.setItem(this.TOKEN_KEY, respuesta.token);
          localStorage.setItem(this.USUARIO_KEY, JSON.stringify(respuesta.usuario));
        })
      );
  }

  logout(): void {
    const token = this.getToken();

    // Avisamos al backend para invalidar el token (best effort, no bloqueamos el logout local)
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {}, // si falla, igual limpiamos la sesión local
      });
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsuario(): Usuario | null {
    const data = localStorage.getItem(this.USUARIO_KEY);
    return data ? JSON.parse(data) : null;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  tieneRol(...roles: string[]): boolean {
    const usuario = this.getUsuario();
    return !!usuario && roles.includes(usuario.rol);
  }
}