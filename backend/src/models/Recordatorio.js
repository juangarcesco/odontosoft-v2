const mongoose = require('mongoose');

const recordatorioSchema = new mongoose.Schema(
  {
    cita: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cita',
      required: true,
    },
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: true,
    },
    canal: {
      type: String,
      enum: ['EMAIL', 'WHATSAPP'],
      required: true,
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: String,
      enum: ['ENVIADO', 'FALLIDO'],
      required: true,
    },
    detalleError: {
      type: String,
      trim: true,
      default: '',
    },
    fechaEnvio: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Evita reenviar el mismo recordatorio dos veces para la misma cita y canal
recordatorioSchema.index({ cita: 1, canal: 1 }, { unique: true });

module.exports = mongoose.model('Recordatorio', recordatorioSchema);