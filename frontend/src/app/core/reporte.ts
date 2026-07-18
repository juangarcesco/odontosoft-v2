import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReporteIngresos {
  mes: string;
  totalIngresos: number;
  cantidadPagos: number;
}

export interface ReportePacientesNuevos {
  mes: string;
  cantidad: number;
}

export interface ReporteTratamiento {
  procedimiento: string;
  cantidad: number;
}

export interface ReporteSaldoPendiente {
  pacienteId: string;
  nombre: string;
  apellido: string;
  telefono: string;
  saldoTotal: number;
  cantidadFacturas: number;
}

export interface ReporteTasaAsistencia {
  citasFinalizadas: number;
  citasNoAsistio: number;
  totalCitasConDesenlace: number;
  tasaAsistencia: number | null;
}

export type TipoReporte = 'ingresos' | 'pacientes-nuevos' | 'tratamientos' | 'saldo-pendiente' | 'tasa-asistencia';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  obtenerIngresos(): Observable<{ reporte: ReporteIngresos }> {
    return this.http.get<{ reporte: ReporteIngresos }>(`${this.baseUrl}/ingresos`);
  }

  obtenerPacientesNuevos(): Observable<{ reporte: ReportePacientesNuevos[] }> {
    return this.http.get<{ reporte: ReportePacientesNuevos[] }>(`${this.baseUrl}/pacientes-nuevos`);
  }

  obtenerTratamientos(): Observable<{ reporte: ReporteTratamiento[] }> {
    return this.http.get<{ reporte: ReporteTratamiento[] }>(`${this.baseUrl}/tratamientos`);
  }

  obtenerSaldoPendiente(): Observable<{ reporte: ReporteSaldoPendiente[] }> {
    return this.http.get<{ reporte: ReporteSaldoPendiente[] }>(`${this.baseUrl}/saldo-pendiente`);
  }

  obtenerTasaAsistencia(): Observable<{ reporte: ReporteTasaAsistencia }> {
    return this.http.get<{ reporte: ReporteTasaAsistencia }>(`${this.baseUrl}/tasa-asistencia`);
  }

  descargarExcel(tipo: TipoReporte): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${tipo}/excel`, { responseType: 'blob' });
  }

  descargarPdf(tipo: TipoReporte): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${tipo}/pdf`, { responseType: 'blob' });
  }
}