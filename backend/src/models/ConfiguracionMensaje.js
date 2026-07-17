const mongoose = require('mongoose');

const configuracionMensajeSchema = new mongoose.Schema(
  {
    // Documento único (singleton): siempre habrá solo uno en la colección
    plantilla: {
      type: String,
      required: true,
      trim: true,
      default:
        'Hola {nombrePaciente}, te recordamos tu cita en OdontoSoft el {fecha} a las {hora}. ¡Te esperamos!',
    },
    actualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConfiguracionMensaje', configuracionMensajeSchema);