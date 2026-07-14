import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitaService, Cita, EstadoCita, PacienteResumen, OdontologoResumen } from '../../../core/cita';

type VistaAgenda = 'dia' | 'semana' | 'mes';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda implements OnInit {
  private citaService = inject(CitaService);

  vista = signal<VistaAgenda>('semana');
  fechaReferencia = signal(new Date());
  citas = signal<Cita[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  rangoTexto = computed(() => {
    const { desde, hasta } = this.calcularRango();
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    if (this.vista() === 'dia') {
      return desde.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    return `${desde.toLocaleDateString('es-CO', opciones)} — ${hasta.toLocaleDateString('es-CO', opciones)}`;
  });

  citasAgrupadasPorDia = computed(() => {
    const grupos = new Map<string, Cita[]>();
    for (const cita of this.citas()) {
      const clave = cita.fecha.substring(0, 10);
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave)!.push(cita);
    }
    // Ordenar cada grupo por hora
    for (const lista of grupos.values()) {
      lista.sort((a, b) => a.hora.localeCompare(b.hora));
    }
    return Array.from(grupos.entries()).sort(([a], [b]) => a.localeCompare(b));
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  cambiarVista(nuevaVista: VistaAgenda): void {
    this.vista.set(nuevaVista);
    this.cargarCitas();
  }

  private calcularRango(): { desde: Date; hasta: Date } {
    const ref = new Date(this.fechaReferencia());

    if (this.vista() === 'dia') {
      return { desde: ref, hasta: ref };
    }

    if (this.vista() === 'semana') {
      const diaSemana = ref.getDay(); // 0 = domingo
      const desde = new Date(ref);
      desde.setDate(ref.getDate() - diaSemana);
      const hasta = new Date(desde);
      hasta.setDate(desde.getDate() + 6);
      return { desde, hasta };
    }

    // mes
    const desde = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const hasta = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return { desde, hasta };
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().substring(0, 10);
  }

  cargarCitas(): void {
    const { desde, hasta } = this.calcularRango();
    this.cargando.set(true);
    this.error.set(null);

    this.citaService
      .listarPorRango(this.formatearFecha(desde), this.formatearFecha(hasta))
      .subscribe({
        next: (respuesta) => {
          this.citas.set(respuesta.citas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('Error al cargar la agenda');
          this.cargando.set(false);
        },
      });
  }

  irAnterior(): void {
    this.moverFecha(-1);
  }

  irSiguiente(): void {
    this.moverFecha(1);
  }

  irHoy(): void {
    this.fechaReferencia.set(new Date());
    this.cargarCitas();
  }

  private moverFecha(direccion: 1 | -1): void {
    const ref = new Date(this.fechaReferencia());
    const dias = this.vista() === 'dia' ? 1 : this.vista() === 'semana' ? 7 : 30;
    ref.setDate(ref.getDate() + dias * direccion);
    this.fechaReferencia.set(ref);
    this.cargarCitas();
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

  formatearNombreDia(fechaISO: string): string {
    const fecha = new Date(fechaISO + 'T00:00:00');
    return fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' });
  }
}