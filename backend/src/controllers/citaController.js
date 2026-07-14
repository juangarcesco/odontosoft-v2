const { crearCita, listarCitasPorRango, cambiarEstadoCita } = require('../services/citaService');


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

async function listar(req, res) {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({ mensaje: 'Los parámetros "desde" y "hasta" son obligatorios' });
    }

    const citas = await listarCitasPorRango(desde, hasta);
    return res.status(200).json({ citas });
  } catch (error) {
    console.error('Error al listar citas:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function cambiarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const cita = await cambiarEstadoCita(id, estado);

    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    return res.status(200).json({ mensaje: 'Estado actualizado exitosamente', cita });
  } catch (error) {
    if (error.codigo === 'ESTADO_INVALIDO') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de cita inválido' });
    }
    console.error('Error al cambiar estado de cita:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear, listar, cambiarEstado };