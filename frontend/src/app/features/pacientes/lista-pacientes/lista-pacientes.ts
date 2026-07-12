import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PacienteService, Paciente, Paginacion } from '../../../core/paciente';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-pacientes.html',
  styleUrl: './lista-pacientes.scss',
})
export class ListaPacientes implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes = signal<Paciente[]>([]);
  paginacion = signal<Paginacion | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  terminoBusqueda = signal('');
  enModoBusqueda = signal(false);

  private busquedaSubject = new Subject<string>();

  ngOnInit(): void {
    this.cargarPacientes(1);

    // Debounce: espera 400ms de silencio antes de buscar, evita disparar
    // una petición HTTP en cada tecla presionada
    this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => this.ejecutarBusqueda(termino));
  }

  onBusquedaChange(termino: string): void {
    this.terminoBusqueda.set(termino);
    this.busquedaSubject.next(termino);
  }

  private ejecutarBusqueda(termino: string): void {
    if (!termino.trim()) {
      this.enModoBusqueda.set(false);
      this.cargarPacientes(1);
      return;
    }

    this.enModoBusqueda.set(true);
    this.cargando.set(true);
    this.error.set(null);

    this.pacienteService.buscar(termino).subscribe({
      next: (respuesta) => {
        this.pacientes.set(respuesta.pacientes);
        this.paginacion.set(null); // la búsqueda no pagina
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al buscar pacientes');
        this.cargando.set(false);
      },
    });
  }

  cargarPacientes(pagina: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pacienteService.listar(pagina, 10).subscribe({
      next: (respuesta) => {
        this.pacientes.set(respuesta.pacientes);
        this.paginacion.set(respuesta.paginacion);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar pacientes');
        this.cargando.set(false);
      },
    });
  }

  irAPagina(pagina: number): void {
    if (pagina < 1) return;
    const totalPaginas = this.paginacion()?.totalPaginas ?? 1;
    if (pagina > totalPaginas) return;
    this.cargarPacientes(pagina);
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda.set('');
    this.enModoBusqueda.set(false);
    this.cargarPacientes(1);
  }
}