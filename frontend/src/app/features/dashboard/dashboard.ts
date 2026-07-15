import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { CitaService, Cita, PacienteResumen, OdontologoResumen, EstadoCita } from '../../core/cita';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private citaService = inject(CitaService);

  citasHoy = signal<Cita[]>([]);
  cargandoCitas = signal(true);
  errorCitas = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarCitasDeHoy();
  }

  private cargarCitasDeHoy(): void {
    this.cargandoCitas.set(true);
    this.citaService.citasDeHoy().subscribe({
      next: (respuesta) => {
        this.citasHoy.set(respuesta.citas);
        this.cargandoCitas.set(false);
      },
      error: () => {
        this.errorCitas.set('No se pudieron cargar las citas de hoy');
        this.cargandoCitas.set(false);
      },
    });
  }

  nombrePaciente(cita: Cita): string {
    const p = cita.paciente as PacienteResumen;
    return typeof cita.paciente === 'string' ? '—' : `${p.nombre} ${p.apellido}`;
  }

  nombreOdontologo(cita: Cita): string {
    const o = cita.odontologo as OdontologoResumen;
    return typeof cita.odontologo === 'string' ? '—' : o.nombre;
  }

  claseEstado(estado: EstadoCita | undefined): string {
    const clases: Record<string, string> = {
      PROGRAMADA: 'estado-programada',
      CONFIRMADA: 'estado-confirmada',
      EN_ATENCION: 'estado-en-atencion',
      FINALIZADA: 'estado-finalizada',
      CANCELADA: 'estado-cancelada',
      NO_ASISTIO: 'estado-no-asistio',
    };
    return clases[estado || 'PROGRAMADA'];
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}