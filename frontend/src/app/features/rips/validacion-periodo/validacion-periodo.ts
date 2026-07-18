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
  generando = signal(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
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
    this.mensajeExito.set(null);
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

  generar(): void {
    this.generando.set(true);
    this.error.set(null);
    this.mensajeExito.set(null);

    this.ripsService.generarRips(this.periodo()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `rips-${this.periodo()}.json`;
        enlace.click();
        window.URL.revokeObjectURL(url);

        this.generando.set(false);
        this.mensajeExito.set('Archivo RIPS generado y descargado exitosamente.');
      },
      error: (err) => {
        this.generando.set(false);
        // El error de "atenciones incompletas" viene con el mismo detalle que ya
        // mostramos en la validación, así que se reutiliza el mensaje del backend
        this.error.set(err.error?.mensaje || 'Error al generar el RIPS');
      },
    });
  }
}