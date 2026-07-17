const mongoose = require('mongoose');

// --- Subdocumento: movimiento de inventario (entrada o salida) ---
const movimientoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ['ENTRADA', 'SALIDA'],
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    motivo: {
      type: String,
      trim: true,
      default: '',
    },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const materialSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del material es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    costoUnitario: {
      type: Number,
      required: [true, 'El costo unitario es obligatorio'],
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stockMinimo: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },
    proveedor: {
      type: String,
      trim: true,
      default: '',
    },
    movimientos: [movimientoSchema],
    estado: {
      type: String,
      enum: ['ACTIVO', 'INACTIVO'],
      default: 'ACTIVO',
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  { timestamps: true }
);

materialSchema.index({ nombre: 1 });

module.exports = mongoose.model('Material', materialSchema);