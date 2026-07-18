import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReporteService,
  ReporteIngresos,
  ReportePacientesNuevos,
  ReporteSaldoPendiente,
  ReporteTasaAsistencia,
  TipoReporte,
} from '../../../core/reporte';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-dashboard-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-reportes.html',
  styleUrl: './dashboard-reportes.scss',
})
export class DashboardReportes implements OnInit {
  private reporteService = inject(ReporteService);
  private authService = inject(AuthService);

  ingresos = signal<ReporteIngresos | null>(null);
  pacientesNuevos = signal<ReportePacientesNuevos[]>([]);
  saldoPendiente = signal<ReporteSaldoPendiente[]>([]);
  tasaAsistencia = signal<ReporteTasaAsistencia | null>(null);

  cargando = signal(true);
  error = signal<string | null>(null);
  descargando = signal<string | null>(null);

  esAdmin = this.authService.getUsuario()?.rol === 'ADMIN';

  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.cargando.set(true);
    this.error.set(null);

    Promise.all([
      this.reporteService.obtenerIngresos().toPromise(),
      this.reporteService.obtenerPacientesNuevos().toPromise(),
      this.reporteService.obtenerSaldoPendiente().toPromise(),
      this.reporteService.obtenerTasaAsistencia().toPromise(),
    ])
      .then(([ingresosResp, pacientesResp, saldoResp, asistenciaResp]) => {
        this.ingresos.set(ingresosResp!.reporte);
        this.pacientesNuevos.set(pacientesResp!.reporte);
        this.saldoPendiente.set(saldoResp!.reporte);
        this.tasaAsistencia.set(asistenciaResp!.reporte);
        this.cargando.set(false);
      })
      .catch(() => {
        this.error.set('Error al cargar los reportes');
        this.cargando.set(false);
      });
  }

  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  alturaBarra(cantidad: number): number {
    const maximo = Math.max(...this.pacientesNuevos().map((p) => p.cantidad), 1);
    return (cantidad / maximo) * 100;
  }

  totalSaldoPendiente(): number {
    return this.saldoPendiente().reduce((suma, p) => suma + p.saldoTotal, 0);
  }

  descargar(tipo: TipoReporte, formato: 'excel' | 'pdf'): void {
    this.descargando.set(`${tipo}-${formato}`);

    const peticion = formato === 'excel' ? this.reporteService.descargarExcel(tipo) : this.reporteService.descargarPdf(tipo);

    peticion.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-${tipo}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
        enlace.click();
        window.URL.revokeObjectURL(url);
        this.descargando.set(null);
      },
      error: () => {
        this.error.set('Error al descargar el reporte');
        this.descargando.set(null);
      },
    });
  }
}