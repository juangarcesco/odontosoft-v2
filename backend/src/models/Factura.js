const mongoose = require('mongoose');

// --- Subdocumento: ítem de la factura (un tratamiento facturado) ---
const itemFacturaSchema = new mongoose.Schema(
  {
    evolucionId: { type: mongoose.Schema.Types.ObjectId },
    diente: { type: Number, min: 1, max: 32 },
    procedimiento: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// --- Subdocumento: pago/abono ---
const pagoSchema = new mongoose.Schema(
  {
    monto: { type: Number, required: true, min: 0.01 },
    metodoPago: {
      type: String,
      enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'],
      required: true,
    },
    fecha: { type: Date, default: Date.now },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: true }
);

const facturaSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
    },
    items: {
      type: [itemFacturaSchema],
      validate: [(arr) => arr.length > 0, 'La factura debe tener al menos un ítem'],
    },
    iva: {
      type: Number,
      default: 0,
    },
    valorTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    pagos: {
      type: [pagoSchema],
      default: [],
    },
    saldoPendiente: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'PAGADA', 'ANULADA'],
      default: 'PENDIENTE',
    },
    motivoAnulacion: {
      type: String,
      trim: true,
      default: '',
    },
    anuladaPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
    fechaAnulacion: {
      type: Date,
      default: null,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  { timestamps: true }
);

facturaSchema.index({ paciente: 1, createdAt: -1 });

module.exports = mongoose.model('Factura', facturaSchema);