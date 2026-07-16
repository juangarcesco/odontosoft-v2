import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Diente, EstadoDiente } from '../../../core/historia-clinica';

const COLORES_ESTADO: Record<EstadoDiente, string> = {
  SANO: '#ffffff',
  CARIES: '#e74c3c',
  OBTURADO: '#3498db',
  EXTRAIDO: '#7f8c8d',
  CORONA: '#f39c12',
  ENDODONCIA: '#9b59b6',
  IMPLANTE: '#16a085',
  FRACTURADO: '#c0392b',
};

const ETIQUETAS_ESTADO: Record<EstadoDiente, string> = {
  SANO: 'Sano',
  CARIES: 'Caries',
  OBTURADO: 'Obturado',
  EXTRAIDO: 'Extraído',
  CORONA: 'Corona',
  ENDODONCIA: 'Endodoncia',
  IMPLANTE: 'Implante',
  FRACTURADO: 'Fracturado',
};

@Component({
  selector: 'app-odontograma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odontograma.html',
  styleUrl: './odontograma.scss',
})
export class Odontograma {
  @Input({ required: true }) dientes: Diente[] = [];
  @Input() soloLectura = false;
  @Output() cambiarDiente = new EventEmitter<{ numero: number; estado: EstadoDiente; observaciones: string }>();

  dienteSeleccionado = signal<Diente | null>(null);
  estadoEditando = signal<EstadoDiente>('SANO');
  observacionesEditando = signal('');

  arcadaSuperior = computed(() => this.dientes.filter((d) => d.numero >= 1 && d.numero <= 16));
  arcadaInferior = computed(() =>
    this.dientes.filter((d) => d.numero >= 17 && d.numero <= 32).slice().reverse()
  );

  estadosDisponibles = Object.keys(COLORES_ESTADO) as EstadoDiente[];

  colorDeEstado(estado: EstadoDiente): string {
    return COLORES_ESTADO[estado];
  }

  etiquetaDeEstado(estado: EstadoDiente): string {
    return ETIQUETAS_ESTADO[estado];
  }

  seleccionarDiente(diente: Diente): void {
    if (this.soloLectura) return;
    this.dienteSeleccionado.set(diente);
    this.estadoEditando.set(diente.estado);
    this.observacionesEditando.set(diente.observaciones);
  }

  cerrarPanel(): void {
    this.dienteSeleccionado.set(null);
  }

  guardarCambio(): void {
    const diente = this.dienteSeleccionado();
    if (!diente) return;

    this.cambiarDiente.emit({
      numero: diente.numero,
      estado: this.estadoEditando(),
      observaciones: this.observacionesEditando(),
    });

    this.cerrarPanel();
  }
}