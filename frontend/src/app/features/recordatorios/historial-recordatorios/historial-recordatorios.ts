import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecordatorioService, Recordatorio } from '../../../core/recordatorio';

@Component({
  selector: 'app-historial-recordatorios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historial-recordatorios.html',
  styleUrl: './historial-recordatorios.scss',
})
export class HistorialRecordatorios implements OnInit {
  private recordatorioService = inject(RecordatorioService);

  recordatorios = signal<Recordatorio[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.cargando.set(true);
    this.recordatorioService.listar().subscribe({
      next: (respuesta) => {
        this.recordatorios.set(respuesta.recordatorios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el historial de recordatorios');
        this.cargando.set(false);
      },
    });
  }

  claseEstado(estado: string): string {
    return estado === 'ENVIADO' ? 'estado-enviado' : 'estado-fallido';
  }

  claseCanal(canal: string): string {
    return canal === 'EMAIL' ? 'canal-email' : 'canal-whatsapp';
  }

  contadorEnviados(): number {
    return this.recordatorios().filter((r) => r.estado === 'ENVIADO').length;
  }

  contadorFallidos(): number {
    return this.recordatorios().filter((r) => r.estado === 'FALLIDO').length;
  }
}