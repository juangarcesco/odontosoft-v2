const {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
  obtenerPacientesConSaldoPendiente,
  obtenerTasaAsistencia,
  generarExcelReporte,
} = require('../services/reporteService');

async function ingresos(req, res) {
  try {
    const reporte = await obtenerIngresosMesActual();
    return res.status(200).json({ reporte });
  } catch (error) {
    console.error('Error al obtener reporte de ingresos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function pacientesNuevos(req, res) {
  try {
    const reporte = await obtenerPacientesNuevosPorMes();
    return res.status(200).json({ reporte });
  } catch (error) {
    console.error('Error al obtener reporte de pacientes nuevos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function tratamientosMasRealizados(req, res) {
  try {
    const reporte = await obtenerTratamientosMasRealizados();
    return res.status(200).json({ reporte });
  } catch (error) {
    console.error('Error al obtener reporte de tratamientos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function saldoPendiente(req, res) {
  try {
    const reporte = await obtenerPacientesConSaldoPendiente();
    return res.status(200).json({ reporte });
  } catch (error) {
    console.error('Error al obtener reporte de saldo pendiente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function tasaAsistencia(req, res) {
  try {
    const reporte = await obtenerTasaAsistencia();
    return res.status(200).json({ reporte });
  } catch (error) {
    console.error('Error al obtener reporte de tasa de asistencia:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function exportarExcel(req, res) {
  try {
    const { tipo } = req.params;
    const buffer = await generarExcelReporte(tipo);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=reporte-${tipo}.xlsx`,
    });

    return res.send(buffer);
  } catch (error) {
    if (error.codigo === 'TIPO_INVALIDO') {
      return res.status(400).json({ mensaje: error.message });
    }
    console.error('Error al exportar reporte a Excel:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = {
  ingresos,
  pacientesNuevos,
  tratamientosMasRealizados,
  saldoPendiente,
  tasaAsistencia,
  exportarExcel,
};