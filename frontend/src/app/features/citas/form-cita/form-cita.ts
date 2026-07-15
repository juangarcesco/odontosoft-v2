import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CitaService, PacienteResumen, OdontologoResumen } from '../../../core/cita';
import { PacienteService, Paciente } from '../../../core/paciente';
import { UsuarioService, Odontologo } from '../../../core/usuario';

@Component({
  selector: 'app-form-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-cita.html',
  styleUrl: './form-cita.scss',
})
export class FormCita implements OnInit {
  private fb = inject(FormBuilder);
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  citaId = signal<string | null>(null);
  modoEdicion = signal(false);
  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  odontologos = signal<Odontologo[]>([]);
  pacientesEncontrados = signal<Paciente[]>([]);
  buscandoPacientes = signal(false);

  citaForm = this.fb.group({
    paciente: ['', [Validators.required]],
    odontologo: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    duracion: [30, [Validators.required]],
    motivo: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.cargarOdontologos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.citaId.set(id);
      this.modoEdicion.set(true);
      this.cargarCita(id);
    }
  }

  private cargarOdontologos(): void {
    this.usuarioService.listarOdontologos().subscribe({
      next: (respuesta) => this.odontologos.set(respuesta.odontologos),
      error: () => this.error.set('Error al cargar la lista de odontólogos'),
    });
  }

  private cargarCita(id: string): void {
    this.cargando.set(true);
    this.citaService.obtenerPorId(id).subscribe({
      next: (respuesta) => {
        const c = respuesta.cita;
        const pacienteId = typeof c.paciente === 'string' ? c.paciente : (c.paciente as PacienteResumen)._id;
        const odontologoId = typeof c.odontologo === 'string' ? c.odontologo : (c.odontologo as OdontologoResumen)._id;

        this.citaForm.patchValue({
          paciente: pacienteId,
          odontologo: odontologoId,
          fecha: c.fecha.substring(0, 10),
          hora: c.hora,
          duracion: c.duracion,
          motivo: c.motivo,
        });

        // Para que el <select> de paciente muestre el nombre en modo edición
        if (typeof c.paciente !== 'string') {
          const p = c.paciente as PacienteResumen;
          this.pacientesEncontrados.set([
            { _id: p._id, nombre: p.nombre, apellido: p.apellido } as Paciente,
          ]);
        }

        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la cita');
        this.cargando.set(false);
      },
    });
  }

  buscarPacientes(termino: string): void {
    if (!termino.trim()) {
      this.pacientesEncontrados.set([]);
      return;
    }
    this.buscandoPacientes.set(true);
    this.pacienteService.buscar(termino).subscribe({
      next: (respuesta) => {
        this.pacientesEncontrados.set(respuesta.pacientes);
        this.buscandoPacientes.set(false);
      },
      error: () => this.buscandoPacientes.set(false),
    });
  }

  onSubmit(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const datos = this.citaForm.value as any;

    const peticion = this.modoEdicion()
      ? this.citaService.editar(this.citaId()!, datos)
      : this.citaService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/citas']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al guardar la cita');
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }
}