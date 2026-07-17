import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface UsuarioResumen {
  _id: string;
  nombre: string;
}

export interface Movimiento {
  _id?: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  registradoPor: string | UsuarioResumen;
  fecha: string;
}

export interface Material {
  _id?: string;
  nombre: string;
  descripcion?: string;
  costoUnitario: number;
  stock: number;
  stockMinimo: number;
  proveedor?: string;
  movimientos: Movimiento[];
  estado?: 'ACTIVO' | 'INACTIVO';
  stockBajo?: boolean;
  createdAt?: string;
}

export interface MaterialResponse {
  mensaje: string;
  material: Material;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/materiales`;

  listar(): Observable<{ materiales: Material[] }> {
    return this.http.get<{ materiales: Material[] }>(this.baseUrl);
  }

  crear(datos: Partial<Material>): Observable<MaterialResponse> {
    return this.http.post<MaterialResponse>(this.baseUrl, datos);
  }

  actualizar(id: string, datos: Partial<Material>): Observable<MaterialResponse> {
    return this.http.put<MaterialResponse>(`${this.baseUrl}/${id}`, datos);
  }

  registrarEntrada(id: string, cantidad: number, motivo: string): Observable<MaterialResponse> {
    return this.http.patch<MaterialResponse>(`${this.baseUrl}/${id}/entrada`, { cantidad, motivo });
  }

  registrarSalida(id: string, cantidad: number, motivo: string): Observable<MaterialResponse> {
    return this.http.patch<MaterialResponse>(`${this.baseUrl}/${id}/salida`, { cantidad, motivo });
  }
}
