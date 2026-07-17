import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordatorioService } from '../../../core/recordatorio';
import { AuthService } from '../../../core/auth';

interface ResultadoEnvioLocal {
  cita: string;
  canal: string;
  estado?: string;
  omitido?: boolean;
  motivo?: string;
  previewUrl?: string;
}

@Component({
  selector: 'app-config-mensaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-mensaje.html',
  styleUrl: './config-mensaje.scss',
})
export class ConfigMensaje implements OnInit {
  private recordatorioService = inject(RecordatorioService);
  private authService = inject(AuthService);

  plantilla = signal<string>('');
  cargando = signal(true);
  guardando = signal(false);
  ejecutando = signal(false);
  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);
  resultadosEnvio = signal<ResultadoEnvioLocal[]>([]);

  esRecepcionista = this.authService.getUsuario()?.rol === 'RECEPCIONISTA';

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  private cargarConfiguracion(): void {
    this.cargando.set(true);
    this.recordatorioService.obtenerConfiguracion().subscribe({
      next: (respuesta) => {
        this.plantilla.set(respuesta.configuracion.plantilla);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la configuración');
        this.cargando.set(false);
      },
    });
  }

  guardarPlantilla(): void {
    if (!this.plantilla().trim()) {
      this.error.set('La plantilla no puede estar vacía');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.mensajeExito.set(null);

    this.recordatorioService.actualizarConfiguracion(this.plantilla()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set('Plantilla guardada exitosamente');
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al guardar la plantilla');
      },
    });
  }

  ejecutarEnvioManual(): void {
    this.ejecutando.set(true);
    this.error.set(null);
    this.resultadosEnvio.set([]);

    this.recordatorioService.ejecutarEnvio().subscribe({
      next: (respuesta) => {
        this.ejecutando.set(false);
        this.resultadosEnvio.set(respuesta.resultados);
      },
      error: (err) => {
        this.ejecutando.set(false);
        this.error.set(err.error?.mensaje || 'Error al ejecutar el envío');
      },
    });
  }
}