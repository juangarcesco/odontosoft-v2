import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { HistoriaClinicaService } from '../../../core/historia-clinica';

@Component({
  selector: 'app-form-evolucion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-evolucion.html',
  styleUrl: './form-evolucion.scss',
})
export class FormEvolucion {
  @Input({ required: true }) pacienteId!: string;
  @Output() evolucionGuardada = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private historiaClinicaService = inject(HistoriaClinicaService);

  guardando = signal(false);
  error = signal<string | null>(null);

  evolucionForm = this.fb.group({
    descripcion: ['', [Validators.required]],
    tratamientos: this.fb.array([this.crearTratamiento()]),
  });

  private crearTratamiento() {
    return this.fb.group({
      diente: [null as number | null],
      procedimiento: ['', [Validators.required]],
      observaciones: [''],
    });
  }

  get tratamientos(): FormArray {
    return this.evolucionForm.get('tratamientos') as FormArray;
  }

  agregarTratamiento(): void {
    this.tratamientos.push(this.crearTratamiento());
  }

  quitarTratamiento(index: number): void {
    if (this.tratamientos.length > 1) {
      this.tratamientos.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.evolucionForm.invalid) {
      this.evolucionForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.evolucionForm.value;
    const datos = {
      descripcion: valores.descripcion!,
      tratamientosRealizados: (valores.tratamientos || [])
        .filter((t) => t?.procedimiento)
        .map((t) => ({
          diente: t!.diente || undefined,
          procedimiento: t!.procedimiento!,
          observaciones: t!.observaciones || '',
        })),
    };

    this.historiaClinicaService.agregarEvolucion(this.pacienteId, datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.evolucionForm.reset({ descripcion: '' });
        this.tratamientos.clear();
        this.tratamientos.push(this.crearTratamiento());
        this.evolucionGuardada.emit();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al registrar la evolución');
      },
    });
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
