import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'ANULADA';

export interface TratamientoFacturable {
  evolucionId?: string;
  fecha: string;
  diente?: number;
  procedimiento: string;
}

export interface ItemFactura {
  evolucionId?: string;
  diente?: number;
  procedimiento: string;
  valor: number;
}

export interface UsuarioResumen {
  _id: string;
  nombre: string;
}

export interface Pago {
  _id?: string;
  monto: number;
  metodoPago: MetodoPago;
  fecha: string;
  registradoPor: string | UsuarioResumen;
}

export interface Factura {
  _id?: string;
  paciente: string;
  items: ItemFactura[];
  iva: number;
  valorTotal: number;
  pagos: Pago[];
  saldoPendiente: number;
  estado: EstadoFactura;
  motivoAnulacion?: string;
  anuladaPor?: string | UsuarioResumen | null;
  fechaAnulacion?: string | null;
  creadoPor?: string | UsuarioResumen;
  createdAt?: string;
}

export interface FacturaResponse {
  mensaje: string;
  factura: Factura;
}

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/facturas`;

  tratamientosFacturables(pacienteId: string): Observable<{ tratamientos: TratamientoFacturable[] }> {
    return this.http.get<{ tratamientos: TratamientoFacturable[] }>(
      `${this.baseUrl}/tratamientos-facturables/${pacienteId}`
    );
  }

  crear(pacienteId: string, items: ItemFactura[]): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(this.baseUrl, { pacienteId, items });
  }

  listarPorPaciente(pacienteId: string): Observable<{ facturas: Factura[] }> {
    return this.http.get<{ facturas: Factura[] }>(`${this.baseUrl}/paciente/${pacienteId}`);
  }

  registrarPago(facturaId: string, monto: number, metodoPago: MetodoPago): Observable<FacturaResponse> {
    return this.http.patch<FacturaResponse>(`${this.baseUrl}/${facturaId}/pagar`, { monto, metodoPago });
  }

  anular(facturaId: string, motivo: string): Observable<FacturaResponse> {
    return this.http.patch<FacturaResponse>(`${this.baseUrl}/${facturaId}/anular`, { motivo });
  }

  descargarPdfUrl(facturaId: string): string {
    return `${this.baseUrl}/${facturaId}/pdf`;
  }

 descargarPdf(facturaId: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/${facturaId}/pdf`, { responseType: 'blob' });
} 
}