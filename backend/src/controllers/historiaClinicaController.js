const { crearHistoriaClinica } = require('../services/historiaClinicaService');

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

module.exports = { crear };