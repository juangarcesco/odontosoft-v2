const {
  crearHistoriaClinica,
  obtenerHistoriaPorPaciente,
  actualizarDiente,
} = require('../services/historiaClinicaService');

async function crear(req, res) {
  try {
    const { pacienteId } = req.body;
    const historia = await crearHistoriaClinica(pacienteId, req.usuario.id);
    return res.status(201).json({ mensaje: 'Historia clínica creada exitosamente', historia });
  } catch (error) {
    if (error.codigo === 'PACIENTE_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ mensaje: 'El paciente ya tiene una historia clínica' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al crear historia clínica:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function obtenerPorPaciente(req, res) {
  try {
    const { pacienteId } = req.params;
    const historia = await obtenerHistoriaPorPaciente(pacienteId);

    if (!historia) {
      return res.status(404).json({ mensaje: 'Este paciente no tiene historia clínica creada' });
    }

    // Filtrar evoluciones desactivadas de la vista "vigente" para roles no-ODONTOLOGO... (ver nota abajo)
    return res.status(200).json({ historia });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al obtener historia clínica:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function actualizarOdontograma(req, res) {
  try {
    const { pacienteId, numeroDiente } = req.params;
    const historia = await actualizarDiente(pacienteId, numeroDiente, req.body);
    return res.status(200).json({ mensaje: 'Odontograma actualizado exitosamente', historia });
  } catch (error) {
    if (error.codigo === 'HISTORIA_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.codigo === 'DIENTE_INVALIDO') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al actualizar odontograma:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear, obtenerPorPaciente, actualizarOdontograma };