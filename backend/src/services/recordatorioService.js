const Cita = require('../models/Cita');
const Recordatorio = require('../models/Recordatorio');
const nodemailer = require('nodemailer');

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

function reemplazarPlaceholders(plantilla, cita) {
  const fecha = new Date(cita.fecha).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return plantilla
    .replace('{nombrePaciente}', `${cita.paciente.nombre} ${cita.paciente.apellido}`)
    .replace('{fecha}', fecha)
    .replace('{hora}', cita.hora);
}

async function enviarEmail(cita, mensaje) {
  if (!cita.paciente.email) {
    return { exito: false, error: 'El paciente no tiene email registrado' };
  }

  try {
    const transportador = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });

    const info = await transportador.sendMail({
      from: '"OdontoSoft" <no-responder@odontosoft.com>',
      to: cita.paciente.email,
      subject: 'Recordatorio de cita — OdontoSoft',
      text: mensaje,
    });

    // Ethereal genera una URL de vista previa del correo "enviado"
    return { exito: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    return { exito: false, error: error.message };
  }
}

module.exports = {
  obtenerCitasElegibles,
  ESTADOS_ELEGIBLES,
  reemplazarPlaceholders,
  enviarEmail,
};