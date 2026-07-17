import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialService } from '../../../core/material';

@Component({
  selector: 'app-form-material',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-material.html',
  styleUrl: './form-material.scss',
})
export class FormMaterial implements OnInit {
  private fb = inject(FormBuilder);
  private materialService = inject(MaterialService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  materialId = signal<string | null>(null);
  modoEdicion = signal(false);
  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  materialForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: [''],
    costoUnitario: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [5, [Validators.required, Validators.min(0)]],
    proveedor: [''],
    stock: [0, [Validators.min(0)]], // solo se usa al crear; en edición queda deshabilitado
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.materialId.set(id);
      this.modoEdicion.set(true);
      // En modo edición, el stock no se toca desde este formulario (se maneja con entrada/salida)
      this.materialForm.get('stock')?.disable();
      this.cargarMaterial(id);
    }
  }

  private cargarMaterial(id: string): void {
    this.cargando.set(true);
    this.materialService.listar().subscribe({
      next: (respuesta) => {
        const material = respuesta.materiales.find((m) => m._id === id);
        if (material) {
          this.materialForm.patchValue({
            nombre: material.nombre,
            descripcion: material.descripcion || '',
            costoUnitario: material.costoUnitario,
            stockMinimo: material.stockMinimo,
            proveedor: material.proveedor || '',
            stock: material.stock,
          });
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el material');
        this.cargando.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.materialForm.getRawValue();

    const peticion = this.modoEdicion()
      ? this.materialService.actualizar(this.materialId()!, {
          nombre: valores.nombre!,
          descripcion: valores.descripcion || '',
          costoUnitario: valores.costoUnitario!,
          stockMinimo: valores.stockMinimo!,
          proveedor: valores.proveedor || '',
        })
      : this.materialService.crear({
          nombre: valores.nombre!,
          descripcion: valores.descripcion || '',
          costoUnitario: valores.costoUnitario!,
          stockMinimo: valores.stockMinimo!,
          proveedor: valores.proveedor || '',
          stock: valores.stock || 0,
        });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/inventario']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.mensaje || 'Error al guardar el material');
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}