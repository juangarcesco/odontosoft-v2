import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FacturaService, Factura, UsuarioResumen } from '../../../core/factura';
import { AuthService } from '../../../core/auth';
import { FormPago } from '../form-pago/form-pago';

@Component({
  selector: 'app-lista-facturas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormPago],
  templateUrl: './lista-facturas.html',
  styleUrl: './lista-facturas.scss',
})
export class ListaFacturas implements OnInit {
  private facturaService = inject(FacturaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  pacienteId = signal<string>('');
  facturas = signal<Factura[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  facturaAbonando = signal<string | null>(null);
  descargandoPdfId = signal<string | null>(null);

  esRecepcionista = this.authService.getUsuario()?.rol === 'RECEPCIONISTA';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('pacienteId');
    if (id) {
      this.pacienteId.set(id);
      this.cargarFacturas();
    }
  }

  private cargarFacturas(): void {
    this.cargando.set(true);
    this.facturaService.listarPorPaciente(this.pacienteId()).subscribe({
      next: (respuesta) => {
        this.facturas.set(respuesta.facturas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el historial de facturas');
        this.cargando.set(false);
      },
    });
  }

  mostrarFormPago(facturaId: string | undefined): void {
    if (!facturaId) return;
    this.facturaAbonando.set(facturaId);
  }

  onPagoRegistrado(): void {
    this.facturaAbonando.set(null);
    this.cargarFacturas();
  }

  anularFactura(facturaId: string | undefined): void {
    if (!facturaId) return;
    const motivo = prompt('Ingrese el motivo de la anulación:');
    if (!motivo || motivo.trim() === '') return;

    this.facturaService.anular(facturaId, motivo).subscribe({
      next: () => this.cargarFacturas(),
      error: (err) => this.error.set(err.error?.mensaje || 'Error al anular la factura'),
    });
  }

  descargarPdf(facturaId: string | undefined): void {
    if (!facturaId) return;
    this.descargandoPdfId.set(facturaId);

    this.facturaService.descargarPdf(facturaId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `factura-${facturaId}.pdf`;
        enlace.click();
        window.URL.revokeObjectURL(url);
        this.descargandoPdfId.set(null);
      },
      error: () => {
        this.error.set('Error al descargar el PDF');
        this.descargandoPdfId.set(null);
      },
    });
  }

  nombreUsuario(valor: string | UsuarioResumen | null | undefined): string {
    if (!valor) return '—';
    return typeof valor === 'string' ? '—' : valor.nombre;
  }

  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      PENDIENTE: 'estado-pendiente',
      PAGADA: 'estado-pagada',
      ANULADA: 'estado-anulada',
    };
    return clases[estado] || '';
  }
}