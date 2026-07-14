import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Odontologo {
  _id: string;
  nombre: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);

  listarOdontologos(): Observable<{ odontologos: Odontologo[] }> {
    return this.http.get<{ odontologos: Odontologo[] }>(`${environment.apiUrl}/usuarios/odontologos`);
  }
}