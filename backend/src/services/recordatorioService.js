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

async function enviarWhatsApp(cita, mensaje) {
  if (!cita.paciente.telefono) {
    return { exito: false, error: 'El paciente no tiene teléfono registrado' };
  }

  // SIMULACIÓN: aquí iría la integración real con un proveedor
  // como Twilio (WhatsApp Business API). La interfaz de esta función
  // (recibe cita + mensaje, devuelve { exito, error? }) es la misma
  // que tendría una integración real, para que conectar un proveedor
  // verdadero en el futuro no requiera cambiar el resto del sistema.

  console.log(`[SIMULADO] Enviando WhatsApp a ${cita.paciente.telefono}: "${mensaje}"`);

  // Simula una pequeña posibilidad de fallo, como tendría cualquier envío real
  const exito = Math.random() > 0.05; // 95% de éxito simulado

  if (!exito) {
    return { exito: false, error: 'Simulación: fallo de red al enviar WhatsApp' };
  }

  return { exito: true, mensajeSimulado: true };
}

module.exports = {
  obtenerCitasElegibles,
  ESTADOS_ELEGIBLES,
  reemplazarPlaceholders,
  enviarEmail,
  enviarWhatsApp,
};