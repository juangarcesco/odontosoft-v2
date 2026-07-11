const Paciente = require('../models/Paciente');

async function crearPaciente(datos, usuarioId) {
  const paciente = await Paciente.create({
    ...datos,
    creadoPor: usuarioId,
  });
  return paciente;
}

async function listarPacientes({ pagina = 1, limite = 10 }) {
  const skip = (pagina - 1) * limite;

  const [pacientes, total] = await Promise.all([
    Paciente.find({ estado: 'ACTIVO' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limite),
    Paciente.countDocuments({ estado: 'ACTIVO' }),
  ]);

  return {
    pacientes,
    paginacion: {
      total,
      pagina: Number(pagina),
      limite: Number(limite),
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

module.exports = { crearPaciente, listarPacientes };
