const { obtenerTratamientosFacturables } = require('../services/facturaService');

async function tratamientosFacturables(req, res) {
  try {
    const { pacienteId } = req.params;
    const tratamientos = await obtenerTratamientosFacturables(pacienteId);
    return res.status(200).json({ tratamientos });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al obtener tratamientos facturables:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { tratamientosFacturables };