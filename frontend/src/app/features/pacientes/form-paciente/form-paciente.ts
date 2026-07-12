import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../core/paciente';

@Component({
  selector: 'app-form-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-paciente.html',
  styleUrl: './form-paciente.scss',
})
export class FormPaciente implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pacienteId = signal<string | null>(null);
  modoEdicion = signal(false);
  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  pacienteForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    tipoDocumento: ['CC', [Validators.required]],
    numeroDocumento: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    sexo: ['M', [Validators.required]],
    telefono: ['', [Validators.required]],
    email: [''],
    direccion: [''],
    ciudad: [''],
    eps: [''],
    grupoSanguineo: ['NO_REGISTRA'],
    alergias: [''],
    observaciones: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.pacienteId.set(id);
      this.modoEdicion.set(true);
      this.cargarPaciente(id);
    }
  }

  private cargarPaciente(id: string): void {
    this.cargando.set(true);
    this.pacienteService.obtenerPorId(id).subscribe({
      next: (respuesta) => {
        const p = respuesta.paciente;
        this.pacienteForm.patchValue({
          nombre: p.nombre,
          apellido: p.apellido,
          tipoDocumento: p.tipoDocumento,
          numeroDocumento: p.numeroDocumento,
          fechaNacimiento: p.fechaNacimiento?.substring(0, 10), // formato yyyy-MM-dd para <input type="date">
          sexo: p.sexo,
          telefono: p.telefono,
          email: p.email || '',
          direccion: p.direccion || '',
          ciudad: p.ciudad || '',
          eps: p.eps || '',
          grupoSanguineo: p.grupoSanguineo || 'NO_REGISTRA',
          alergias: p.alergias || '',
          observaciones: p.observaciones || '',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el paciente');
        this.cargando.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const datos = this.pacienteForm.value as any;

    const peticion = this.modoEdicion()
      ? this.pacienteService.actualizar(this.pacienteId()!, datos)
      : this.pacienteService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al guardar el paciente');
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/pacientes']);
  }
}
