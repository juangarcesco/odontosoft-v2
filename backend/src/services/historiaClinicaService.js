const HistoriaClinica = require('../models/HistoriaClinica');
const Paciente = require('../models/Paciente');

async function crearHistoriaClinica(pacienteId, usuarioId) {
  const paciente = await Paciente.findById(pacienteId);
  if (!paciente) {
    const error = new Error('El paciente no existe');
    error.codigo = 'PACIENTE_NO_EXISTE';
    throw error;
  }

  const historia = await HistoriaClinica.create({
    paciente: pacienteId,
    creadoPor: usuarioId,
  });

  return historia;
}

module.exports = { crearHistoriaClinica };