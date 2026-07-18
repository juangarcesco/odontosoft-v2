import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RipsService, ArchivoRips, UsuarioResumen } from '../../../core/rips';

@Component({
  selector: 'app-historial-rips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial-rips.html',
  styleUrl: './historial-rips.scss',
})
export class HistorialRips implements OnInit {
  private ripsService = inject(RipsService);

  archivos = signal<ArchivoRips[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.cargando.set(true);
    this.ripsService.obtenerHistorial().subscribe({
      next: (respuesta) => {
        this.archivos.set(respuesta.archivos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el historial de archivos RIPS');
        this.cargando.set(false);
      },
    });
  }

  nombreUsuario(valor: string | UsuarioResumen | null | undefined): string {
    if (!valor) return '—';
    return typeof valor === 'string' ? '—' : valor.nombre;
  }

  formatearPeriodo(periodo: string): string {
    const [anio, mes] = periodo.split('-');
    const nombresMes = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${nombresMes[Number(mes) - 1]} ${anio}`;
  }
}