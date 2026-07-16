import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoDiente =
  | 'SANO'
  | 'CARIES'
  | 'OBTURADO'
  | 'EXTRAIDO'
  | 'CORONA'
  | 'ENDODONCIA'
  | 'IMPLANTE'
  | 'FRACTURADO';

export interface Diente {
  numero: number;
  estado: EstadoDiente;
  observaciones: string;
}

export interface TratamientoRealizado {
  diente?: number;
  procedimiento: string;
  observaciones?: string;
}

export interface UsuarioResumen {
  _id: string;
  nombre: string;
}

export interface Evolucion {
  _id?: string;
  fecha: string;
  odontologo: string | UsuarioResumen;
  descripcion: string;
  tratamientosRealizados: TratamientoRealizado[];
  activo: boolean;
  desactivadoPor?: string | UsuarioResumen | null;
  fechaDesactivacion?: string | null;
  createdAt?: string;
}

export interface Adjunto {
  _id?: string;
  nombreArchivo: string;
  url: string;
  tipo: 'RADIOGRAFIA' | 'FOTO' | 'OTRO';
  subidoPor: string | UsuarioResumen;
  fechaSubida: string;
}

export interface HistoriaClinica {
  _id?: string;
  paciente: string;
  antecedentesMedicos: string;
  odontograma: Diente[];
  evoluciones: Evolucion[];
  adjuntos: Adjunto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HistoriaClinicaResponse {
  mensaje: string;
  historia: HistoriaClinica;
}

@Injectable({ providedIn: 'root' })
export class HistoriaClinicaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/historias-clinicas`;

  crear(pacienteId: string): Observable<HistoriaClinicaResponse> {
    return this.http.post<HistoriaClinicaResponse>(this.baseUrl, { pacienteId });
  }

  obtenerPorPaciente(pacienteId: string): Observable<{ historia: HistoriaClinica }> {
    return this.http.get<{ historia: HistoriaClinica }>(`${this.baseUrl}/paciente/${pacienteId}`);
  }

  actualizarDiente(
    pacienteId: string,
    numeroDiente: number,
    datos: { estado?: EstadoDiente; observaciones?: string }
  ): Observable<HistoriaClinicaResponse> {
    return this.http.patch<HistoriaClinicaResponse>(
      `${this.baseUrl}/paciente/${pacienteId}/odontograma/${numeroDiente}`,
      datos
    );
  }

  agregarEvolucion(
    pacienteId: string,
    datos: { descripcion: string; fecha?: string; tratamientosRealizados?: TratamientoRealizado[] }
  ): Observable<HistoriaClinicaResponse> {
    return this.http.post<HistoriaClinicaResponse>(
      `${this.baseUrl}/paciente/${pacienteId}/evoluciones`,
      datos
    );
  }

  actualizarAntecedentes(pacienteId: string, antecedentesMedicos: string): Observable<HistoriaClinicaResponse> {
    return this.http.patch<HistoriaClinicaResponse>(
      `${this.baseUrl}/paciente/${pacienteId}/antecedentes`,
      { antecedentesMedicos }
    );
  }

  desactivarEvolucion(pacienteId: string, evolucionId: string): Observable<HistoriaClinicaResponse> {
    return this.http.patch<HistoriaClinicaResponse>(
      `${this.baseUrl}/paciente/${pacienteId}/evoluciones/${evolucionId}/desactivar`,
      {}
    );
  }

  subirAdjunto(pacienteId: string, archivo: File, tipo: string): Observable<HistoriaClinicaResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo', tipo);
    return this.http.post<HistoriaClinicaResponse>(
      `${this.baseUrl}/paciente/${pacienteId}/adjuntos`,
      formData
    );
  }
}