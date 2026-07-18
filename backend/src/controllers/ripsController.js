const { validarPeriodo, generarYRegistrarRips } = require('../services/ripsService');

function validarFormatoPeriodo(periodo) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(periodo);
}

async function validar(req, res) {
  try {
    const { periodo } = req.query;

    if (!periodo || !validarFormatoPeriodo(periodo)) {
      return res.status(400).json({ mensaje: 'El periodo debe tener formato YYYY-MM, ej. 2026-07' });
    }

    const resultado = await validarPeriodo(periodo);
    return res.status(200).json({ validacion: resultado });
  } catch (error) {
    console.error('Error al validar periodo RIPS:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { validar, validarFormatoPeriodo };