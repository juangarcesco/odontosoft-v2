import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService, MetodoPago } from '../../../core/factura';

@Component({
  selector: 'app-form-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-pago.html',
  styleUrl: './form-pago.scss',
})
export class FormPago {
  @Input({ required: true }) facturaId!: string;
  @Input({ required: true }) saldoPendiente!: number;
  @Output() pagoRegistrado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  private facturaService = inject(FacturaService);

  monto = signal<number>(0);
  metodoPago = signal<MetodoPago>('EFECTIVO');
  guardando = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (this.monto() <= 0) {
      this.error.set('El monto debe ser mayor a cero');
      return;
    }

    if (this.monto() > this.saldoPendiente) {
      this.error.set(`El monto no puede superar el saldo pendiente ($${this.saldoPendiente.toLocaleString('es-CO')})`);
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.facturaService.registrarPago(this.facturaId, this.monto(), this.metodoPago()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.pagoRegistrado.emit();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al registrar el pago');
      },
    });
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}