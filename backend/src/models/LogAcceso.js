const mongoose = require('mongoose');

const logAccesoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  exito: {
    type: Boolean,
    required: true,
  },
  motivo: {
    type: String, // ej: "credenciales inválidas", "login exitoso", "usuario inactivo"
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LogAcceso', logAccesoSchema);