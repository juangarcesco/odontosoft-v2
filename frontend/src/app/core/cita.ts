import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoCita =
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'EN_ATENCION'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'NO_ASISTIO';

export interface PacienteResumen {
  _id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface OdontologoResumen {
  _id: string;
  nombre: string;
}

export interface Cita {
  _id?: string;
  paciente: string | PacienteResumen;
  odontologo: string | OdontologoResumen;
  fecha: string;
  hora: string;
  duracion: 30 | 45 | 60;
  motivo: string;
  estado?: EstadoCita;
  createdAt?: string;
  updatedAt?: string;
}

export interface CitaResponse {
  mensaje: string;
  cita: Cita;
}

export interface ListaCitasResponse {
  citas: Cita[];
}

@Injectable({ providedIn: 'root' })
export class CitaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/citas`;

  listarPorRango(desde: string, hasta: string): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(
      `${this.baseUrl}?desde=${desde}&hasta=${hasta}`
    );
  }

  citasDeHoy(): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(`${this.baseUrl}/hoy`);
  }

  crear(cita: Partial<Cita>): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.baseUrl, cita);
  }

  editar(id: string, cambios: Partial<Cita>): Observable<CitaResponse> {
    return this.http.put<CitaResponse>(`${this.baseUrl}/${id}`, cambios);
  }

  cambiarEstado(id: string, estado: EstadoCita): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.baseUrl}/${id}/estado`, { estado });
  }

  cancelar(id: string): Observable<CitaResponse> {
    return this.http.patch<CitaResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}