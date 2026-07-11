const Paciente = require('../models/Paciente');

async function crearPaciente(datos, usuarioId) {
  const paciente = await Paciente.create({
    ...datos,
    creadoPor: usuarioId,
  });
  return paciente;
}

module.exports = { crearPaciente };