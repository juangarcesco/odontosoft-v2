const {
  obtenerConfiguracion,
  actualizarConfiguracion,
  ejecutarEnvioRecordatorios,
} = require('../services/recordatorioService');

async function obtenerConfig(req, res) {
  try {
    const config = await obtenerConfiguracion();
    return res.status(200).json({ configuracion: config });
  } catch (error) {
    console.error('Error al obtener configuración de mensaje:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function actualizarConfig(req, res) {
  try {
    const { plantilla } = req.body;
    const config = await actualizarConfiguracion(plantilla, req.usuario.id);
    return res.status(200).json({ mensaje: 'Plantilla actualizada exitosamente', configuracion: config });
  } catch (error) {
    if (error.codigo === 'PLANTILLA_VACIA') {
      return res.status(400).json({ mensaje: error.message });
    }
    console.error('Error al actualizar configuración:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function ejecutarEnvio(req, res) {
  try {
    const resultados = await ejecutarEnvioRecordatorios();
    return res.status(200).json({ mensaje: 'Proceso de envío ejecutado', resultados });
  } catch (error) {
    console.error('Error al ejecutar envío de recordatorios:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { obtenerConfig, actualizarConfig, ejecutarEnvio };