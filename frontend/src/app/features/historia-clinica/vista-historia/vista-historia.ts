import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  HistoriaClinicaService,
  HistoriaClinica,
  Evolucion,
  UsuarioResumen,
  EstadoDiente,
} from '../../../core/historia-clinica';
import { AuthService } from '../../../core/auth';
import { Odontograma } from '../odontograma/odontograma';
import { FormEvolucion } from '../form-evolucion/form-evolucion';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vista-historia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Odontograma, FormEvolucion],
  templateUrl: './vista-historia.html',
  styleUrl: './vista-historia.scss',
})
export class VistaHistoria implements OnInit {
  private historiaClinicaService = inject(HistoriaClinicaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  pacienteId = signal<string>('');
  historia = signal<HistoriaClinica | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  creandoHistoria = signal(false);
  mostrandoFormEvolucion = signal(false);
  antecedentesEditando = signal('');
  guardandoAntecedentes = signal(false);
  subiendoAdjunto = signal(false);

  esOdontologo = computed(() => this.authService.getUsuario()?.rol === 'ODONTOLOGO');
  esAdmin = computed(() => this.authService.getUsuario()?.rol === 'ADMIN');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('pacienteId');
    if (id) {
      this.pacienteId.set(id);
      this.cargarHistoria();
    }
  }

  private cargarHistoria(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.historiaClinicaService.obtenerPorPaciente(this.pacienteId()).subscribe({
      next: (respuesta) => {
        this.historia.set(respuesta.historia);
        this.antecedentesEditando.set(respuesta.historia.antecedentesMedicos);
        this.cargando.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.historia.set(null);
        } else {
          this.error.set('Error al cargar la historia clínica');
        }
        this.cargando.set(false);
      },
    });
  }

  crearHistoria(): void {
    this.creandoHistoria.set(true);
    this.historiaClinicaService.crear(this.pacienteId()).subscribe({
      next: () => {
        this.creandoHistoria.set(false);
        this.cargarHistoria();
      },
      error: (err) => {
        this.creandoHistoria.set(false);
        this.error.set(err.error?.mensaje || 'Error al crear la historia clínica');
      },
    });
  }

  onCambiarDiente(cambio: { numero: number; estado: EstadoDiente; observaciones: string }): void {
    this.historiaClinicaService
      .actualizarDiente(this.pacienteId(), cambio.numero, {
        estado: cambio.estado,
        observaciones: cambio.observaciones,
      })
      .subscribe({
        next: () => this.cargarHistoria(),
        error: () => this.error.set('Error al actualizar el diente'),
      });
  }

  guardarAntecedentes(): void {
    this.guardandoAntecedentes.set(true);
    this.historiaClinicaService
      .actualizarAntecedentes(this.pacienteId(), this.antecedentesEditando())
      .subscribe({
        next: () => this.guardandoAntecedentes.set(false),
        error: () => {
          this.guardandoAntecedentes.set(false);
          this.error.set('Error al guardar los antecedentes');
        },
      });
  }

  onEvolucionGuardada(): void {
    this.mostrandoFormEvolucion.set(false);
    this.cargarHistoria();
  }

  desactivarEvolucion(evolucionId: string | undefined): void {
    if (!evolucionId) return;
    const confirmado = confirm('¿Seguro que deseas desactivar esta evolución? Quedará marcada como no vigente, pero visible para trazabilidad.');
    if (!confirmado) return;

    this.historiaClinicaService.desactivarEvolucion(this.pacienteId(), evolucionId).subscribe({
      next: () => this.cargarHistoria(),
      error: () => this.error.set('Error al desactivar la evolución'),
    });
  }

  onSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.subiendoAdjunto.set(true);
    this.historiaClinicaService.subirAdjunto(this.pacienteId(), archivo, 'RADIOGRAFIA').subscribe({
      next: () => {
        this.subiendoAdjunto.set(false);
        this.cargarHistoria();
        input.value = '';
      },
      error: () => {
        this.subiendoAdjunto.set(false);
        this.error.set('Error al subir el archivo');
        input.value = '';
      },
    });
  }

  urlCompleta(rutaRelativa: string): string {
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${rutaRelativa}`;
  }

  nombreUsuario(valor: string | UsuarioResumen | null | undefined): string {
    if (!valor) return '—';
    return typeof valor === 'string' ? '—' : valor.nombre;
  }
}