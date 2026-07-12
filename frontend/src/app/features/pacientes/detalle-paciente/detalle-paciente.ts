import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PacienteService, Paciente } from '../../../core/paciente';

@Component({
  selector: 'app-detalle-paciente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-paciente.html',
  styleUrl: './detalle-paciente.scss',
})
export class DetallePaciente implements OnInit {
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  paciente = signal<Paciente | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  desactivando = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/pacientes']);
      return;
    }
    this.cargarPaciente(id);
  }

  private cargarPaciente(id: string): void {
    this.cargando.set(true);
    this.pacienteService.obtenerPorId(id).subscribe({
      next: (respuesta) => {
        this.paciente.set(respuesta.paciente);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 404 ? 'Paciente no encontrado' : 'Error al cargar el paciente'
        );
        this.cargando.set(false);
      },
    });
  }

  calcularEdad(fechaNacimiento: string | undefined): number | null {
    if (!fechaNacimiento) return null;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  desactivarPaciente(): void {
    const p = this.paciente();
    if (!p?._id) return;

    const confirmado = confirm(
      `¿Seguro que deseas desactivar a ${p.nombre} ${p.apellido}? Podrá reactivarse más adelante si es necesario.`
    );
    if (!confirmado) return;

    this.desactivando.set(true);
    this.pacienteService.desactivar(p._id).subscribe({
      next: () => {
        this.desactivando.set(false);
        this.router.navigate(['/pacientes']);
      },
      error: () => {
        this.desactivando.set(false);
        this.error.set('Error al desactivar el paciente');
      },
    });
  }
}