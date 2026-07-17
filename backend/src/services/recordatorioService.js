const Cita = require('../models/Cita');
const Recordatorio = require('../models/Recordatorio');
const ConfiguracionMensaje = require('../models/ConfiguracionMensaje');
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

    return { exito: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    return { exito: false, error: error.message };
  }
}

async function enviarWhatsApp(cita, mensaje) {
  if (!cita.paciente.telefono) {
    return { exito: false, error: 'El paciente no tiene teléfono registrado' };
  }

  console.log(`[SIMULADO] Enviando WhatsApp a ${cita.paciente.telefono}: "${mensaje}"`);

  const exito = Math.random() > 0.05;

  if (!exito) {
    return { exito: false, error: 'Simulación: fallo de red al enviar WhatsApp' };
  }

  return { exito: true, mensajeSimulado: true };
}

async function obtenerConfiguracion() {
  let config = await ConfiguracionMensaje.findOne();

  // Si nunca se ha configurado, se crea con la plantilla por defecto
  if (!config) {
    config = await ConfiguracionMensaje.create({});
  }

  return config;
}

async function actualizarConfiguracion(plantilla, usuarioId) {
  if (!plantilla || plantilla.trim() === '') {
    const error = new Error('La plantilla no puede estar vacía');
    error.codigo = 'PLANTILLA_VACIA';
    throw error;
  }

  let config = await ConfiguracionMensaje.findOne();

  if (!config) {
    config = await ConfiguracionMensaje.create({ plantilla, actualizadoPor: usuarioId });
  } else {
    config.plantilla = plantilla;
    config.actualizadoPor = usuarioId;
    await config.save();
  }

  return config;
}

module.exports = {
  obtenerCitasElegibles,
  ESTADOS_ELEGIBLES,
  reemplazarPlaceholders,
  enviarEmail,
  enviarWhatsApp,
  obtenerConfiguracion,
  actualizarConfiguracion,
};