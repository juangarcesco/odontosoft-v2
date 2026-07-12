import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Paciente {
  _id?: string;
  nombre: string;
  apellido: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PA' | 'RC';
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F' | 'OTRO';
  telefono: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  eps?: string;
  grupoSanguineo?: string;
  alergias?: string;
  observaciones?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  createdAt?: string;
  updatedAt?: string;
}

export interface Paginacion {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ListaPacientesResponse {
  pacientes: Paciente[];
  paginacion: Paginacion;
}

export interface PacienteResponse {
  mensaje: string;
  paciente: Paciente;
}

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pacientes`;

  listar(pagina = 1, limite = 10): Observable<ListaPacientesResponse> {
    return this.http.get<ListaPacientesResponse>(
      `${this.baseUrl}?pagina=${pagina}&limite=${limite}`
    );
  }

  buscar(termino: string): Observable<{ pacientes: Paciente[] }> {
    return this.http.get<{ pacientes: Paciente[] }>(
      `${this.baseUrl}/buscar?q=${encodeURIComponent(termino)}`
    );
  }

  obtenerPorId(id: string): Observable<{ paciente: Paciente }> {
    return this.http.get<{ paciente: Paciente }>(`${this.baseUrl}/${id}`);
  }

  crear(paciente: Paciente): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(this.baseUrl, paciente);
  }

  actualizar(id: string, paciente: Partial<Paciente>): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.baseUrl}/${id}`, paciente);
  }

  desactivar(id: string): Observable<PacienteResponse> {
    return this.http.patch<PacienteResponse>(`${this.baseUrl}/${id}/desactivar`, {});
  }
}