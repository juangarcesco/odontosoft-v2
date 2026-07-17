import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FacturaService, TratamientoFacturable, ItemFactura } from '../../../core/factura';
import { PacienteService, Paciente } from '../../../core/paciente';

interface ItemSeleccionado extends ItemFactura {
  seleccionado: boolean;
}

@Component({
  selector: 'app-form-factura',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './form-factura.html',
  styleUrl: './form-factura.scss',
})
export class FormFactura implements OnInit {
  private facturaService = inject(FacturaService);
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  pacienteId = signal<string>('');
  paciente = signal<Paciente | null>(null);
  tratamientos = signal<ItemSeleccionado[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);

  itemsSeleccionados = computed(() =>
    this.tratamientos().filter((t) => t.seleccionado && t.valor > 0)
  );

  totalFactura = computed(() =>
    this.itemsSeleccionados().reduce((suma, item) => suma + item.valor, 0)
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('pacienteId');
    if (!id) {
      this.router.navigate(['/pacientes']);
      return;
    }
    this.pacienteId.set(id);
    this.cargarDatos(id);
  }

  private cargarDatos(pacienteId: string): void {
    this.cargando.set(true);

    this.pacienteService.obtenerPorId(pacienteId).subscribe({
      next: (respuesta) => this.paciente.set(respuesta.paciente),
      error: () => this.error.set('Error al cargar el paciente'),
    });

    this.facturaService.tratamientosFacturables(pacienteId).subscribe({
      next: (respuesta) => {
        this.tratamientos.set(
          respuesta.tratamientos.map((t: TratamientoFacturable) => ({
            evolucionId: t.evolucionId,
            diente: t.diente,
            procedimiento: t.procedimiento,
            valor: 0,
            seleccionado: false,
          }))
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los tratamientos facturables');
        this.cargando.set(false);
      },
    });
  }

  onToggleSeleccion(index: number): void {
    this.tratamientos.update((lista) => {
      const copia = [...lista];
      copia[index] = { ...copia[index], seleccionado: !copia[index].seleccionado };
      return copia;
    });
  }

  onCambiarValor(index: number, valor: string): void {
    const numero = Number(valor) || 0;
    this.tratamientos.update((lista) => {
      const copia = [...lista];
      copia[index] = { ...copia[index], valor: numero };
      return copia;
    });
  }

  crearFactura(): void {
    if (this.itemsSeleccionados().length === 0) {
      this.error.set('Selecciona al menos un tratamiento con un valor mayor a cero');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const items: ItemFactura[] = this.itemsSeleccionados().map(
      ({ evolucionId, diente, procedimiento, valor }) => ({ evolucionId, diente, procedimiento, valor })
    );

    this.facturaService.crear(this.pacienteId(), items).subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        this.router.navigate(['/pacientes', this.pacienteId(), 'facturacion']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al crear la factura');
      },
    });
  }

  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO');
  }
}
