import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MaterialService, Material } from '../../../core/material';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-lista-materiales',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-materiales.html',
  styleUrl: './lista-materiales.scss',
})
export class ListaMateriales implements OnInit {
  private materialService = inject(MaterialService);
  private authService = inject(AuthService);

  materiales = signal<Material[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  esRecepcionista = this.authService.getUsuario()?.rol === 'RECEPCIONISTA';

  ngOnInit(): void {
    this.cargarMateriales();
  }

  private cargarMateriales(): void {
    this.cargando.set(true);
    this.materialService.listar().subscribe({
      next: (respuesta) => {
        this.materiales.set(respuesta.materiales);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el inventario');
        this.cargando.set(false);
      },
    });
  }

  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  cantidadStockBajo(): number {
    return this.materiales().filter((m) => m.stockBajo).length;
  }
}
