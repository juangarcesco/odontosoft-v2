const mongoose = require('mongoose');

// --- Subdocumento: Diente individual del odontograma ---
const dienteSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      min: 1,
      max: 32,
    },
    estado: {
      type: String,
      enum: ['SANO', 'CARIES', 'OBTURADO', 'EXTRAIDO', 'CORONA', 'ENDODONCIA', 'IMPLANTE', 'FRACTURADO'],
      default: 'SANO',
    },
    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false } // no necesita su propio _id, se identifica por "numero"
);

// --- Subdocumento: Tratamiento realizado dentro de una evolución ---
const tratamientoRealizadoSchema = new mongoose.Schema(
  {
    diente: {
      type: Number,
      min: 1,
      max: 32,
    },
    procedimiento: {
      type: String,
      required: [true, 'El procedimiento es obligatorio'],
      trim: true,
    },
    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

// --- Subdocumento: Adjunto (imagen/radiografía) ---
const adjuntoSchema = new mongoose.Schema(
  {
    nombreArchivo: { type: String, required: true },
    url: { type: String, required: true },
    tipo: { type: String, enum: ['RADIOGRAFIA', 'FOTO', 'OTRO'], default: 'OTRO' },
    subidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaSubida: { type: Date, default: Date.now },
  },
  { _id: true }
);

// --- Subdocumento: Evolución clínica ---
const evolucionSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      required: [true, 'La fecha de la evolución es obligatoria'],
      default: Date.now,
    },
    odontologo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción de la evolución es obligatoria'],
      trim: true,
    },
    tratamientosRealizados: [tratamientoRealizadoSchema],
    activo: {
      type: Boolean,
      default: true, // false = desactivado por ADMIN (RN-10), sin eliminarse
    },
    desactivadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
    fechaDesactivacion: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// --- Documento principal: Historia Clínica ---
const historiaClinicaSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
      unique: true, // RF-25: una historia clínica única por paciente
    },
    antecedentesMedicos: {
      type: String,
      trim: true,
      default: '',
    },
    odontograma: {
      type: [dienteSchema],
      default: () =>
        Array.from({ length: 32 }, (_, i) => ({ numero: i + 1, estado: 'SANO', observaciones: '' })),
    },
    evoluciones: {
      type: [evolucionSchema],
      default: [],
    },
    adjuntos: {
      type: [adjuntoSchema],
      default: [],
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HistoriaClinica', historiaClinicaSchema);