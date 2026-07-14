const { crearCita } = require('../services/citaService');

async function crear(req, res) {
  try {
    const cita = await crearCita(req.body, req.usuario.id);
    return res.status(201).json({
      mensaje: 'Cita creada exitosamente',
      cita,
    });
  } catch (error) {
    if (error.codigo === 'PACIENTE_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.codigo === 'PACIENTE_INACTIVO') {
      return res.status(409).json({ mensaje: error.message });
    }
    if (error.codigo === 'CONFLICTO_HORARIO') {
      return res.status(409).json({ mensaje: error.message });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente u odontólogo inválido' });
    }
    console.error('Error al crear cita:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear };