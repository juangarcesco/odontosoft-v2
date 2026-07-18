import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AtencionIncompleta {
  facturaId: string;
  paciente: string;
  camposFaltantes: string[];
}

export interface ValidacionPeriodo {
  periodo: string;
  totalFacturas: number;
  completas: number;
  incompletas: AtencionIncompleta[];
}

export interface UsuarioResumen {
  _id: string;
  nombre: string;
}

export interface ArchivoRips {
  _id: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadAtenciones: number;
  generadoPor: string | UsuarioResumen;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RipsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rips`;

  validarPeriodo(periodo: string): Observable<{ validacion: ValidacionPeriodo }> {
    return this.http.get<{ validacion: ValidacionPeriodo }>(`${this.baseUrl}/validar?periodo=${periodo}`);
  }

  generarRips(periodo: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/generar`, { periodo }, { responseType: 'blob' });
  }

  obtenerHistorial(): Observable<{ archivos: ArchivoRips[] }> {
    return this.http.get<{ archivos: ArchivoRips[] }>(`${this.baseUrl}/historial`);
  }
}