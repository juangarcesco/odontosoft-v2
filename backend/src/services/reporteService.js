const Factura = require('../models/Factura');
const Paciente = require('../models/Paciente');
const HistoriaClinica = require('../models/HistoriaClinica');
const Cita = require('../models/Cita');
const ExcelJS = require('exceljs');

async function obtenerIngresosMesActual() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

  const facturas = await Factura.find({
    'pagos.fecha': { $gte: inicioMes, $lte: finMes },
    estado: { $ne: 'ANULADA' },
  });

  let totalIngresos = 0;
  let cantidadPagos = 0;

  facturas.forEach((factura) => {
    factura.pagos.forEach((pago) => {
      if (pago.fecha >= inicioMes && pago.fecha <= finMes) {
        totalIngresos += pago.monto;
        cantidadPagos++;
      }
    });
  });

  return {
    mes: inicioMes.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    totalIngresos,
    cantidadPagos,
  };
}

async function obtenerPacientesNuevosPorMes(meses = 6) {
  const ahora = new Date();
  const resultado = [];

  for (let i = meses - 1; i >= 0; i--) {
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0, 23, 59, 59);

    const cantidad = await Paciente.countDocuments({
      createdAt: { $gte: inicioMes, $lte: finMes },
    });

    resultado.push({
      mes: inicioMes.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
      cantidad,
    });
  }

  return resultado;
}

async function obtenerTratamientosMasRealizados(limite = 10) {
  const resultado = await HistoriaClinica.aggregate([
    { $unwind: '$evoluciones' },
    { $match: { 'evoluciones.activo': true } },
    { $unwind: '$evoluciones.tratamientosRealizados' },
    {
      $group: {
        _id: '$evoluciones.tratamientosRealizados.procedimiento',
        cantidad: { $sum: 1 },
      },
    },
    { $sort: { cantidad: -1 } },
    { $limit: limite },
    { $project: { _id: 0, procedimiento: '$_id', cantidad: 1 } },
  ]);

  return resultado;
}

async function obtenerPacientesConSaldoPendiente() {
  const resultado = await Factura.aggregate([
    { $match: { estado: 'PENDIENTE', saldoPendiente: { $gt: 0 } } },
    {
      $group: {
        _id: '$paciente',
        saldoTotal: { $sum: '$saldoPendiente' },
        cantidadFacturas: { $sum: 1 },
      },
    },
    { $sort: { saldoTotal: -1 } },
    {
      $lookup: {
        from: 'pacientes',
        localField: '_id',
        foreignField: '_id',
        as: 'paciente',
      },
    },
    { $unwind: '$paciente' },
    {
      $project: {
        _id: 0,
        pacienteId: '$paciente._id',
        nombre: '$paciente.nombre',
        apellido: '$paciente.apellido',
        telefono: '$paciente.telefono',
        saldoTotal: 1,
        cantidadFacturas: 1,
      },
    },
  ]);

  return resultado;
}

async function obtenerTasaAsistencia() {
  // Solo se consideran citas cuyo desenlace ya se conoce (no Programada/Confirmada, que aún están pendientes)
  const ESTADOS_FINALIZADOS = ['FINALIZADA', 'NO_ASISTIO'];

  const resultado = await Cita.aggregate([
    { $match: { estado: { $in: ESTADOS_FINALIZADOS } } },
    {
      $group: {
        _id: '$estado',
        cantidad: { $sum: 1 },
      },
    },
  ]);

  const finalizadas = resultado.find((r) => r._id === 'FINALIZADA')?.cantidad || 0;
  const noAsistio = resultado.find((r) => r._id === 'NO_ASISTIO')?.cantidad || 0;
  const total = finalizadas + noAsistio;

  const tasaAsistencia = total > 0 ? Math.round((finalizadas / total) * 100) : null;

  return {
    citasFinalizadas: finalizadas,
    citasNoAsistio: noAsistio,
    totalCitasConDesenlace: total,
    tasaAsistencia, // porcentaje, o null si no hay datos suficientes
  };
}

async function generarExcelReporte(tipoReporte) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OdontoSoft';
  workbook.created = new Date();

  const hoja = workbook.addWorksheet('Reporte');

  switch (tipoReporte) {
    case 'ingresos': {
      const datos = await obtenerIngresosMesActual();
      hoja.columns = [
        { header: 'Mes', key: 'mes', width: 25 },
        { header: 'Total de ingresos (COP)', key: 'totalIngresos', width: 25 },
        { header: 'Cantidad de pagos', key: 'cantidadPagos', width: 20 },
      ];
      hoja.addRow(datos);
      break;
    }

    case 'pacientes-nuevos': {
      const datos = await obtenerPacientesNuevosPorMes();
      hoja.columns = [
        { header: 'Mes', key: 'mes', width: 20 },
        { header: 'Pacientes nuevos', key: 'cantidad', width: 20 },
      ];
      hoja.addRows(datos);
      break;
    }

    case 'tratamientos': {
      const datos = await obtenerTratamientosMasRealizados();
      hoja.columns = [
        { header: 'Procedimiento', key: 'procedimiento', width: 35 },
        { header: 'Cantidad realizada', key: 'cantidad', width: 20 },
      ];
      hoja.addRows(datos);
      break;
    }

    case 'saldo-pendiente': {
      const datos = await obtenerPacientesConSaldoPendiente();
      hoja.columns = [
        { header: 'Paciente', key: 'nombreCompleto', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 18 },
        { header: 'Facturas pendientes', key: 'cantidadFacturas', width: 20 },
        { header: 'Saldo total (COP)', key: 'saldoTotal', width: 20 },
      ];
      hoja.addRows(
        datos.map((d) => ({ ...d, nombreCompleto: `${d.nombre} ${d.apellido}` }))
      );
      break;
    }

    case 'tasa-asistencia': {
      const datos = await obtenerTasaAsistencia();
      hoja.columns = [
        { header: 'Citas finalizadas', key: 'citasFinalizadas', width: 20 },
        { header: 'Citas sin asistencia', key: 'citasNoAsistio', width: 22 },
        { header: 'Total con desenlace', key: 'totalCitasConDesenlace', width: 22 },
        { header: 'Tasa de asistencia (%)', key: 'tasaAsistencia', width: 22 },
      ];
      hoja.addRow(datos);
      break;
    }

    default: {
      const error = new Error('Tipo de reporte no reconocido');
      error.codigo = 'TIPO_INVALIDO';
      throw error;
    }
  }

  // Encabezado en negrita, consistente en cualquier reporte generado
  hoja.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
  obtenerPacientesConSaldoPendiente,
  obtenerTasaAsistencia,
  generarExcelReporte,
};