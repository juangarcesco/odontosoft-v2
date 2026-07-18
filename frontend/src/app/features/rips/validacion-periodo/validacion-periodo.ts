import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RipsService, ValidacionPeriodo } from '../../../core/rips';

@Component({
  selector: 'app-validacion-periodo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './validacion-periodo.html',
  styleUrl: './validacion-periodo.scss',
})
export class ValidacionPeriodoComponent implements OnInit {
  private ripsService = inject(RipsService);

  periodo = signal<string>('');
  validacion = signal<ValidacionPeriodo | null>(null);
  validando = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Precarga el periodo actual (formato YYYY-MM) como punto de partida cómodo
    const ahora = new Date();
    const mesActual = String(ahora.getMonth() + 1).padStart(2, '0');
    this.periodo.set(`${ahora.getFullYear()}-${mesActual}`);
  }

  validar(): void {
    if (!this.periodo()) {
      this.error.set('Selecciona un periodo');
      return;
    }

    this.validando.set(true);
    this.error.set(null);
    this.validacion.set(null);

    this.ripsService.validarPeriodo(this.periodo()).subscribe({
      next: (respuesta) => {
        this.validando.set(false);
        this.validacion.set(respuesta.validacion);
      },
      error: (err) => {
        this.validando.set(false);
        this.error.set(err.error?.mensaje || 'Error al validar el periodo');
      },
    });
  }

  puedeGenerar(): boolean {
    const v = this.validacion();
    return !!v && v.completas > 0 && v.incompletas.length === 0;
  }
}