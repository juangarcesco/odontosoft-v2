const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Factura = require('../models/Factura');
const Paciente = require('../models/Paciente');
const HistoriaClinica = require('../models/HistoriaClinica');
const Cita = require('../models/Cita');

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
    tasaAsistencia,
  };
}

const TITULOS_REPORTE = {
  ingresos: 'Reporte de Ingresos del Mes',
  'pacientes-nuevos': 'Reporte de Pacientes Nuevos por Mes',
  tratamientos: 'Reporte de Tratamientos Más Realizados',
  'saldo-pendiente': 'Reporte de Pacientes con Saldo Pendiente',
  'tasa-asistencia': 'Reporte de Tasa de Asistencia a Citas',
};

async function obtenerDatosReporte(tipoReporte) {
  switch (tipoReporte) {
    case 'ingresos':
      return obtenerIngresosMesActual();
    case 'pacientes-nuevos':
      return obtenerPacientesNuevosPorMes();
    case 'tratamientos':
      return obtenerTratamientosMasRealizados();
    case 'saldo-pendiente':
      return obtenerPacientesConSaldoPendiente();
    case 'tasa-asistencia':
      return obtenerTasaAsistencia();
    default: {
      const error = new Error('Tipo de reporte no reconocido');
      error.codigo = 'TIPO_INVALIDO';
      throw error;
    }
  }
}

async function generarExcelReporte(tipoReporte) {
  const datos = await obtenerDatosReporte(tipoReporte);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OdontoSoft';
  workbook.created = new Date();

  const hoja = workbook.addWorksheet('Reporte');

  switch (tipoReporte) {
    case 'ingresos':
      hoja.columns = [
        { header: 'Mes', key: 'mes', width: 25 },
        { header: 'Total de ingresos (COP)', key: 'totalIngresos', width: 25 },
        { header: 'Cantidad de pagos', key: 'cantidadPagos', width: 20 },
      ];
      hoja.addRow(datos);
      break;

    case 'pacientes-nuevos':
      hoja.columns = [
        { header: 'Mes', key: 'mes', width: 20 },
        { header: 'Pacientes nuevos', key: 'cantidad', width: 20 },
      ];
      hoja.addRows(datos);
      break;

    case 'tratamientos':
      hoja.columns = [
        { header: 'Procedimiento', key: 'procedimiento', width: 35 },
        { header: 'Cantidad realizada', key: 'cantidad', width: 20 },
      ];
      hoja.addRows(datos);
      break;

    case 'saldo-pendiente':
      hoja.columns = [
        { header: 'Paciente', key: 'nombreCompleto', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 18 },
        { header: 'Facturas pendientes', key: 'cantidadFacturas', width: 20 },
        { header: 'Saldo total (COP)', key: 'saldoTotal', width: 20 },
      ];
      hoja.addRows(datos.map((d) => ({ ...d, nombreCompleto: `${d.nombre} ${d.apellido}` })));
      break;

    case 'tasa-asistencia':
      hoja.columns = [
        { header: 'Citas finalizadas', key: 'citasFinalizadas', width: 20 },
        { header: 'Citas sin asistencia', key: 'citasNoAsistio', width: 22 },
        { header: 'Total con desenlace', key: 'totalCitasConDesenlace', width: 22 },
        { header: 'Tasa de asistencia (%)', key: 'tasaAsistencia', width: 22 },
      ];
      hoja.addRow(datos);
      break;
  }

  hoja.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

function generarPdfReporte(tipoReporte, datos) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(18).text('OdontoSoft', { align: 'left' });
    doc.fontSize(14).fillColor('#2c3e50').text(TITULOS_REPORTE[tipoReporte] || 'Reporte', { align: 'left' });
    doc.fontSize(9).fillColor('#7f8c8d').text(`Generado el ${new Date().toLocaleDateString('es-CO')}`);
    doc.moveDown(1.5);

    doc.fillColor('#000000');

    switch (tipoReporte) {
      case 'ingresos':
        doc.fontSize(11).text(`Mes: ${datos.mes}`);
        doc.text(`Total de ingresos: $${datos.totalIngresos.toLocaleString('es-CO')}`);
        doc.text(`Cantidad de pagos: ${datos.cantidadPagos}`);
        break;

      case 'pacientes-nuevos':
        datos.forEach((d) => doc.fontSize(10).text(`${d.mes}: ${d.cantidad} paciente(s) nuevo(s)`));
        break;

      case 'tratamientos':
        if (datos.length === 0) {
          doc.fontSize(10).text('No hay tratamientos registrados.');
        }
        datos.forEach((d, i) =>
          doc.fontSize(10).text(`${i + 1}. ${d.procedimiento} — ${d.cantidad} vez(veces)`)
        );
        break;

      case 'saldo-pendiente':
        if (datos.length === 0) {
          doc.fontSize(10).text('No hay pacientes con saldo pendiente.');
        }
        datos.forEach((d) =>
          doc
            .fontSize(10)
            .text(
              `${d.nombre} ${d.apellido} (${d.telefono}) — ${d.cantidadFacturas} factura(s) — $${d.saldoTotal.toLocaleString('es-CO')}`
            )
        );
        break;

      case 'tasa-asistencia':
        doc.fontSize(11).text(`Citas finalizadas: ${datos.citasFinalizadas}`);
        doc.text(`Citas sin asistencia: ${datos.citasNoAsistio}`);
        doc.text(`Total con desenlace conocido: ${datos.totalCitasConDesenlace}`);
        doc.text(
          `Tasa de asistencia: ${datos.tasaAsistencia !== null ? datos.tasaAsistencia + '%' : 'Sin datos suficientes'}`
        );
        break;
    }

    doc.end();
  });
}

async function generarPdfReporteCompleto(tipoReporte) {
  const datos = await obtenerDatosReporte(tipoReporte);
  return generarPdfReporte(tipoReporte, datos);
}

module.exports = {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
  obtenerPacientesConSaldoPendiente,
  obtenerTasaAsistencia,
  generarExcelReporte,
  generarPdfReporteCompleto,
};