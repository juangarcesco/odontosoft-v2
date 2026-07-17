import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type Canal = 'EMAIL' | 'WHATSAPP';
export type EstadoRecordatorio = 'ENVIADO' | 'FALLIDO';

export interface UsuarioResumen {
  _id: string;
  nombre: string;
}

export interface PacienteResumen {
  _id: string;
  nombre: string;
  apellido: string;
}

export interface CitaResumen {
  _id: string;
  fecha: string;
  hora: string;
  motivo: string;
}

export interface ConfiguracionMensaje {
  _id?: string;
  plantilla: string;
  actualizadoPor?: string | UsuarioResumen;
  updatedAt?: string;
}

export interface Recordatorio {
  _id: string;
  cita: CitaResumen;
  paciente: PacienteResumen;
  canal: Canal;
  mensaje: string;
  estado: EstadoRecordatorio;
  detalleError?: string;
  fechaEnvio: string;
}

export interface ResultadoEjecucion {
  cita: string;
  canal: Canal;
  estado?: EstadoRecordatorio;
  omitido?: boolean;
  motivo?: string;
  previewUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class RecordatorioService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/recordatorios`;

  obtenerConfiguracion(): Observable<{ configuracion: ConfiguracionMensaje }> {
    return this.http.get<{ configuracion: ConfiguracionMensaje }>(`${this.baseUrl}/configuracion`);
  }

  actualizarConfiguracion(plantilla: string): Observable<{ mensaje: string; configuracion: ConfiguracionMensaje }> {
    return this.http.put<{ mensaje: string; configuracion: ConfiguracionMensaje }>(
      `${this.baseUrl}/configuracion`,
      { plantilla }
    );
  }

  ejecutarEnvio(): Observable<{ mensaje: string; resultados: ResultadoEjecucion[] }> {
    return this.http.post<{ mensaje: string; resultados: ResultadoEjecucion[] }>(`${this.baseUrl}/ejecutar`, {});
  }

  listar(): Observable<{ recordatorios: Recordatorio[] }> {
    return this.http.get<{ recordatorios: Recordatorio[] }>(this.baseUrl);
  }
}