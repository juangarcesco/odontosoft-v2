const Cita = require('../models/Cita');
const Recordatorio = require('../models/Recordatorio');

const ESTADOS_ELEGIBLES = ['PROGRAMADA', 'CONFIRMADA'];

async function obtenerCitasElegibles() {
  const ahora = new Date();
  const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  const citas = await Cita.find({
    estado: { $in: ESTADOS_ELEGIBLES },
    fecha: { $gte: ahora, $lte: en24Horas },
  })
    .populate('paciente', 'nombre apellido email telefono')
    .populate('odontologo', 'nombre');

  return citas;
}

module.exports = { obtenerCitasElegibles, ESTADOS_ELEGIBLES };