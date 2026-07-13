const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema(
  {
    paciente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      required: [true, 'El paciente es obligatorio'],
    },
    odontologo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El odontólogo es obligatorio'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    hora: {
      type: String, // formato "HH:mm", ej. "14:30"
      required: [true, 'La hora es obligatoria'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'La hora debe tener formato HH:mm'],
    },
    duracion: {
      type: Number, // minutos
      enum: [30, 45, 60],
      default: 30,
      required: [true, 'La duración es obligatoria'],
    },
    motivo: {
      type: String,
      trim: true,
      required: [true, 'El motivo de la cita es obligatorio'],
    },
    estado: {
      type: String,
      enum: ['PROGRAMADA', 'CONFIRMADA', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO'],
      default: 'PROGRAMADA',
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  { timestamps: true }
);

// Acelera las consultas de agenda por rango de fechas (RF-17) y la
// verificación de conflictos de horario por odontólogo (RN-01)
citaSchema.index({ odontologo: 1, fecha: 1 });

module.exports = mongoose.model('Cita', citaSchema);