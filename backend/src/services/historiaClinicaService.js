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

async function obtenerHistoriaPorPaciente(pacienteId) {
  const historia = await HistoriaClinica.findOne({ paciente: pacienteId })
    .populate('evoluciones.odontologo', 'nombre')
    .populate('adjuntos.subidoPor', 'nombre');
  return historia;
}

async function actualizarDiente(pacienteId, numeroDiente, datosActualizados) {
  const historia = await HistoriaClinica.findOne({ paciente: pacienteId });

  if (!historia) {
    const error = new Error('Este paciente no tiene historia clínica creada');
    error.codigo = 'HISTORIA_NO_EXISTE';
    throw error;
  }

  const diente = historia.odontograma.find((d) => d.numero === Number(numeroDiente));

  if (!diente) {
    const error = new Error('Número de diente inválido');
    error.codigo = 'DIENTE_INVALIDO';
    throw error;
  }

  if (datosActualizados.estado !== undefined) {
    diente.estado = datosActualizados.estado;
  }
  if (datosActualizados.observaciones !== undefined) {
    diente.observaciones = datosActualizados.observaciones;
  }

  await historia.save();

  return historia;
}

module.exports = { crearHistoriaClinica, obtenerHistoriaPorPaciente, actualizarDiente };