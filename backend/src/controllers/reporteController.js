const {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
  obtenerPacientesConSaldoPendiente,
  obtenerTasaAsistencia,
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

module.exports = {
  ingresos,
  pacientesNuevos,
  tratamientosMasRealizados,
  saldoPendiente,
  tasaAsistencia,
};