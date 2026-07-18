const mongoose = require('mongoose');

const archivoRipsSchema = new mongoose.Schema(
  {
    periodo: {
      // formato "YYYY-MM", ej. "2026-07"
      type: String,
      required: true,
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaFin: {
      type: Date,
      required: true,
    },
    facturasIncluidas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Factura',
      },
    ],
    cantidadAtenciones: {
      type: Number,
      required: true,
      min: 0,
    },
    generadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  { timestamps: true }
);

archivoRipsSchema.index({ periodo: 1, createdAt: -1 });

module.exports = mongoose.model('ArchivoRips', archivoRipsSchema);