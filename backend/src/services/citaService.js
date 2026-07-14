const Cita = require('../models/Cita');
const Paciente = require('../models/Paciente');

const ESTADOS_QUE_BLOQUEAN_HORARIO = ['PROGRAMADA', 'CONFIRMADA'];

const ESTADOS_VALIDOS = ['PROGRAMADA', 'CONFIRMADA', 'EN_ATENCION', 'FINALIZADA', 'CANCELADA', 'NO_ASISTIO'];


function horaAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

async function existeConflictoHorario({ odontologo, fecha, hora, duracion, citaIdExcluir = null }) {
  const inicioNueva = horaAMinutos(hora);
  const finNueva = inicioNueva + duracion;

  const inicioDia = new Date(fecha);
  inicioDia.setUTCHours(0, 0, 0, 0);
  const finDia = new Date(fecha);
  finDia.setUTCHours(23, 59, 59, 999);

  const filtro = {
    odontologo,
    fecha: { $gte: inicioDia, $lte: finDia },
    estado: { $in: ESTADOS_QUE_BLOQUEAN_HORARIO },
  };

  if (citaIdExcluir) {
    filtro._id = { $ne: citaIdExcluir };
  }

  const citasDelDia = await Cita.find(filtro);

  return citasDelDia.some((citaExistente) => {
    const inicioExistente = horaAMinutos(citaExistente.hora);
    const finExistente = inicioExistente + citaExistente.duracion;
    // Dos rangos se solapan si uno empieza antes de que el otro termine, en ambos sentidos
    return inicioNueva < finExistente && inicioExistente < finNueva;
  });
}

async function crearCita(datos, usuarioId) {
  const paciente = await Paciente.findById(datos.paciente);
  if (!paciente) {
    const error = new Error('El paciente no existe');
    error.codigo = 'PACIENTE_NO_EXISTE';
    throw error;
  }
  if (paciente.estado !== 'ACTIVO') {
    const error = new Error('No se puede agendar una cita para un paciente inactivo');
    error.codigo = 'PACIENTE_INACTIVO';
    throw error;
  }

  const hayConflicto = await existeConflictoHorario({
    odontologo: datos.odontologo,
    fecha: datos.fecha,
    hora: datos.hora,
    duracion: datos.duracion || 30,
  });

  if (hayConflicto) {
    const error = new Error('El odontólogo ya tiene una cita programada en ese horario');
    error.codigo = 'CONFLICTO_HORARIO';
    throw error;
  }

  const cita = await Cita.create({
    ...datos,
    creadoPor: usuarioId,
  });

  return cita;
}

async function listarCitasPorRango(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  inicio.setUTCHours(0, 0, 0, 0);

  const fin = new Date(fechaFin);
  fin.setUTCHours(23, 59, 59, 999);

  const citas = await Cita.find({
    fecha: { $gte: inicio, $lte: fin },
  })
    .populate('paciente', 'nombre apellido telefono')
    .populate('odontologo', 'nombre')
    .sort({ fecha: 1, hora: 1 });

  return citas;
}


async function cambiarEstadoCita(id, nuevoEstado) {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    const error = new Error(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    error.codigo = 'ESTADO_INVALIDO';
    throw error;
  }

  const cita = await Cita.findByIdAndUpdate(
    id,
    { estado: nuevoEstado },
    { new: true }
  );

  return cita;
}

async function editarCita(id, datos) {
  const citaExistente = await Cita.findById(id);
  if (!citaExistente) {
    return null;
  }

  // Solo revalidar conflicto si cambia algo que afecte el horario ocupado
  const cambiaHorario =
    datos.fecha !== undefined ||
    datos.hora !== undefined ||
    datos.duracion !== undefined ||
    datos.odontologo !== undefined;

  if (cambiaHorario) {
    const hayConflicto = await existeConflictoHorario({
      odontologo: datos.odontologo || citaExistente.odontologo,
      fecha: datos.fecha || citaExistente.fecha,
      hora: datos.hora || citaExistente.hora,
      duracion: datos.duracion || citaExistente.duracion,
      citaIdExcluir: id,
    });

    if (hayConflicto) {
      const error = new Error('El odontólogo ya tiene una cita programada en ese horario');
      error.codigo = 'CONFLICTO_HORARIO';
      throw error;
    }
  }

  // No permitir cambiar el estado por esta vía (eso es responsabilidad de cambiarEstadoCita)
  const { estado, creadoPor, _id, ...datosPermitidos } = datos;

  const citaActualizada = await Cita.findByIdAndUpdate(id, datosPermitidos, {
    new: true,
    runValidators: true,
  });

  return citaActualizada;
}

async function cancelarCita(id) {
  const cita = await Cita.findByIdAndUpdate(
    id,
    { estado: 'CANCELADA' },
    { new: true }
  );
  return cita;
}

module.exports = {
  crearCita,
  existeConflictoHorario,
  listarCitasPorRango,
  cambiarEstadoCita,
  editarCita,
  cancelarCita,
};