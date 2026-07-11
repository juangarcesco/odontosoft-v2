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

function escaparRegex(texto) {
  return texto.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function construirPatronInsensibleATildes(termino) {
  const mapaAcentos = {
    a: '[aàáâãä]',
    e: '[eèéêë]',
    i: '[iìíîï]',
    o: '[oòóôõö]',
    u: '[uùúûü]',
    n: '[nñ]',
  };

  return termino
    .toLowerCase()
    .split('')
    .map((caracter) => mapaAcentos[caracter] || escaparRegex(caracter))
    .join('');
}

async function buscarPacientes(termino) {
  if (!termino || termino.trim() === '') {
    return [];
  }

  const patron = construirPatronInsensibleATildes(termino.trim());
  const regex = new RegExp(patron, 'i');

  const pacientes = await Paciente.find({
    estado: 'ACTIVO',
    $or: [
      { nombre: regex },
      { apellido: regex },
      { numeroDocumento: regex },
    ],
  }).limit(20);

  return pacientes;
}

module.exports = { crearPaciente, listarPacientes, buscarPacientes };
