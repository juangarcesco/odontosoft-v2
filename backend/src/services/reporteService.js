const Factura = require('../models/Factura');

async function obtenerIngresosMesActual() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

  // Solo se cuentan los pagos efectivamente recibidos (no el valor facturado total),
  // ya que "ingresos" implica dinero realmente cobrado, no solo emitido
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

module.exports = { obtenerIngresosMesActual };