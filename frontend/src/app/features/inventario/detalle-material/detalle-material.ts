import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MaterialService, Material, TipoMovimiento, UsuarioResumen } from '../../../core/material';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-detalle-material',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-material.html',
  styleUrl: './detalle-material.scss',
})
export class DetalleMaterial implements OnInit {
  private materialService = inject(MaterialService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  materialId = signal<string>('');
  material = signal<Material | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  mostrandoFormMovimiento = signal<TipoMovimiento | null>(null);
  cantidad = signal<number>(0);
  motivo = signal<string>('');
  guardandoMovimiento = signal(false);

  esRecepcionista = this.authService.getUsuario()?.rol === 'RECEPCIONISTA';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.materialId.set(id);
      this.cargarMaterial();
    }
  }

  private cargarMaterial(): void {
    this.cargando.set(true);
    this.materialService.listar().subscribe({
      next: (respuesta) => {
        const encontrado = respuesta.materiales.find((m) => m._id === this.materialId());
        this.material.set(encontrado || null);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el material');
        this.cargando.set(false);
      },
    });
  }

  abrirFormMovimiento(tipo: TipoMovimiento): void {
    this.mostrandoFormMovimiento.set(tipo);
    this.cantidad.set(0);
    this.motivo.set('');
    this.error.set(null);
  }

  cancelarMovimiento(): void {
    this.mostrandoFormMovimiento.set(null);
  }

  confirmarMovimiento(): void {
    if (this.cantidad() <= 0) {
      this.error.set('La cantidad debe ser mayor a cero');
      return;
    }

    this.guardandoMovimiento.set(true);
    this.error.set(null);

    const tipo = this.mostrandoFormMovimiento();
    const peticion =
      tipo === 'ENTRADA'
        ? this.materialService.registrarEntrada(this.materialId(), this.cantidad(), this.motivo())
        : this.materialService.registrarSalida(this.materialId(), this.cantidad(), this.motivo());

    peticion.subscribe({
      next: () => {
        this.guardandoMovimiento.set(false);
        this.mostrandoFormMovimiento.set(null);
        this.cargarMaterial();
      },
      error: (err) => {
        this.guardandoMovimiento.set(false);
        this.error.set(err.error?.mensaje || 'Error al registrar el movimiento');
      },
    });
  }

  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  nombreUsuario(valor: string | UsuarioResumen | null | undefined): string {
    if (!valor) return '—';
    return typeof valor === 'string' ? '—' : valor.nombre;
  }

  movimientosOrdenados() {
    return [...(this.material()?.movimientos || [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }
}