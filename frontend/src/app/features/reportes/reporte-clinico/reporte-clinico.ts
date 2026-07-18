import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReporteService, ReporteTratamiento } from '../../../core/reporte';

@Component({
  selector: 'app-reporte-clinico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reporte-clinico.html',
  styleUrl: './reporte-clinico.scss',
})
export class ReporteClinico implements OnInit {
  private reporteService = inject(ReporteService);

  tratamientos = signal<ReporteTratamiento[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  descargando = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarReporte();
  }

  private cargarReporte(): void {
    this.cargando.set(true);
    this.reporteService.obtenerTratamientos().subscribe({
      next: (respuesta) => {
        this.tratamientos.set(respuesta.reporte);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el reporte de tratamientos');
        this.cargando.set(false);
      },
    });
  }

  anchoBarra(cantidad: number): number {
    const maximo = Math.max(...this.tratamientos().map((t) => t.cantidad), 1);
    return (cantidad / maximo) * 100;
  }

  descargar(formato: 'excel' | 'pdf'): void {
    this.descargando.set(formato);

    const peticion = formato === 'excel'
      ? this.reporteService.descargarExcel('tratamientos')
      : this.reporteService.descargarPdf('tratamientos');

    peticion.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `reporte-tratamientos.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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