const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
    },
    tipoDocumento: {
      type: String,
      enum: ['CC', 'TI', 'CE', 'PA', 'RC'],
      required: [true, 'El tipo de documento es obligatorio'],
    },
    numeroDocumento: {
      type: String,
      required: [true, 'El número de documento es obligatorio'],
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    sexo: {
      type: String,
      enum: ['M', 'F', 'OTRO'],
      required: [true, 'El sexo es obligatorio'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido'],
    },
    direccion: {
      type: String,
      trim: true,
    },
    ciudad: {
      type: String,
      trim: true,
    },
    eps: {
      type: String,
      trim: true,
    },
    grupoSanguineo: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'NO_REGISTRA'],
      default: 'NO_REGISTRA',
    },
    alergias: {
      type: String,
      trim: true,
      default: '',
    },
    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
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

// RF-16: no se puede repetir el mismo número + tipo de documento (RN-02)
pacienteSchema.index({ tipoDocumento: 1, numeroDocumento: 1 }, { unique: true });

// Índice de texto para búsqueda por nombre (RF-11)
pacienteSchema.index({ nombre: 'text', apellido: 'text' });

module.exports = mongoose.model('Paciente', pacienteSchema);