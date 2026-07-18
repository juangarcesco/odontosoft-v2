const Factura = require('../models/Factura');
const Paciente = require('../models/Paciente');
const HistoriaClinica = require('../models/HistoriaClinica');

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

module.exports = {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
  obtenerPacientesConSaldoPendiente,
};