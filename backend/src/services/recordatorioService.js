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

async function ejecutarEnvioRecordatorios() {
  const citas = await obtenerCitasElegibles();
  const config = await obtenerConfiguracion();

  const resultados = [];

  for (const cita of citas) {
    const mensaje = reemplazarPlaceholders(config.plantilla, cita);

    for (const canal of ['EMAIL', 'WHATSAPP']) {
      // Evita reenviar si ya existe un recordatorio para esta cita+canal (índice único del modelo)
      const yaExiste = await Recordatorio.findOne({ cita: cita._id, canal });
      if (yaExiste) {
        resultados.push({ cita: cita._id, canal, omitido: true, motivo: 'Ya enviado previamente' });
        continue;
      }

      const resultadoEnvio =
        canal === 'EMAIL' ? await enviarEmail(cita, mensaje) : await enviarWhatsApp(cita, mensaje);

      try {
        const recordatorio = await Recordatorio.create({
          cita: cita._id,
          paciente: cita.paciente._id,
          canal,
          mensaje,
          estado: resultadoEnvio.exito ? 'ENVIADO' : 'FALLIDO',
          detalleError: resultadoEnvio.error || '',
        });

        resultados.push({
          cita: cita._id,
          canal,
          estado: recordatorio.estado,
          previewUrl: resultadoEnvio.previewUrl,
        });
      } catch (error) {
        // Si el índice único rechaza (carrera entre ejecuciones simultáneas), se omite sin romper el flujo
        resultados.push({ cita: cita._id, canal, omitido: true, motivo: 'Conflicto de duplicado' });
      }
    }
  }

  return resultados;
}

async function listarRecordatorios() {
  const recordatorios = await Recordatorio.find()
    .populate('paciente', 'nombre apellido')
    .populate('cita', 'fecha hora motivo')
    .sort({ createdAt: -1 });

  return recordatorios;
}

module.exports = {
  obtenerCitasElegibles,
  ESTADOS_ELEGIBLES,
  reemplazarPlaceholders,
  enviarEmail,
  enviarWhatsApp,
  obtenerConfiguracion,
  actualizarConfiguracion,
  ejecutarEnvioRecordatorios,
  listarRecordatorios,
};