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
    // 1. "Aplana" el array de evoluciones, un documento por cada evolución
    { $unwind: '$evoluciones' },
    // 2. Solo evoluciones activas (respeta RN-10: las desactivadas no cuentan)
    { $match: { 'evoluciones.activo': true } },
    // 3. "Aplana" el array de tratamientos dentro de cada evolución
    { $unwind: '$evoluciones.tratamientosRealizados' },
    // 4. Agrupa por nombre de procedimiento y cuenta ocurrencias
    {
      $group: {
        _id: '$evoluciones.tratamientosRealizados.procedimiento',
        cantidad: { $sum: 1 },
      },
    },
    // 5. Ordena de mayor a menor frecuencia
    { $sort: { cantidad: -1 } },
    // 6. Limita a los N más frecuentes
    { $limit: limite },
    // 7. Renombra _id a "procedimiento" para una respuesta más clara
    { $project: { _id: 0, procedimiento: '$_id', cantidad: 1 } },
  ]);

  return resultado;
}

module.exports = {
  obtenerIngresosMesActual,
  obtenerPacientesNuevosPorMes,
  obtenerTratamientosMasRealizados,
};