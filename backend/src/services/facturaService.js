const HistoriaClinica = require('../models/HistoriaClinica');
const Factura = require('../models/Factura');
const METODOS_PAGO_VALIDOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];



async function obtenerTratamientosFacturables(pacienteId) {
  const historia = await HistoriaClinica.findOne({ paciente: pacienteId });

  if (!historia) {
    return [];
  }

  // Solo se exponen los campos mínimos necesarios para facturar,
  // nunca la descripción clínica completa ni el resto de la historia
  const tratamientos = [];

  historia.evoluciones
    .filter((evolucion) => evolucion.activo)
    .forEach((evolucion) => {
      evolucion.tratamientosRealizados.forEach((tratamiento) => {
        tratamientos.push({
          evolucionId: evolucion._id,
          fecha: evolucion.fecha,
          diente: tratamiento.diente,
          procedimiento: tratamiento.procedimiento,
        });
      });
    });

  return tratamientos;
}

async function crearFactura(pacienteId, items, usuarioId) {
  if (!items || items.length === 0) {
    const error = new Error('La factura debe tener al menos un ítem');
    error.codigo = 'SIN_ITEMS';
    throw error;
  }

  const valorTotal = items.reduce((suma, item) => suma + item.valor, 0);

  const factura = await Factura.create({
    paciente: pacienteId,
    items,
    valorTotal,
    saldoPendiente: valorTotal, // al crearse, nada se ha pagado aún
    creadoPor: usuarioId,
  });

  return factura;
}

async function registrarPago(facturaId, monto, metodoPago, usuarioId) {
  if (!METODOS_PAGO_VALIDOS.includes(metodoPago)) {
    const error = new Error(`Método de pago inválido. Valores permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}`);
    error.codigo = 'METODO_INVALIDO';
    throw error;
  }

  const factura = await Factura.findById(facturaId);

  if (!factura) {
    const error = new Error('Factura no encontrada');
    error.codigo = 'FACTURA_NO_EXISTE';
    throw error;
  }

  if (factura.estado === 'ANULADA') {
    const error = new Error('No se pueden registrar pagos sobre una factura anulada');
    error.codigo = 'FACTURA_ANULADA';
    throw error;
  }

  if (monto > factura.saldoPendiente) {
    const error = new Error(
      `El monto del abono ($${monto}) no puede superar el saldo pendiente ($${factura.saldoPendiente})`
    );
    error.codigo = 'MONTO_EXCEDE_SALDO';
    throw error;
  }

  factura.pagos.push({
    monto,
    metodoPago,
    registradoPor: usuarioId,
  });

  // RN-05: el saldo se recalcula automáticamente, nunca se recibe del cliente
  factura.saldoPendiente = factura.saldoPendiente - monto;

  if (factura.saldoPendiente === 0) {
    factura.estado = 'PAGADA';
  }

  await factura.save();

  return factura;
}

async function anularFactura(facturaId, motivo, usuarioId) {
  const factura = await Factura.findById(facturaId);

  if (!factura) {
    const error = new Error('Factura no encontrada');
    error.codigo = 'FACTURA_NO_EXISTE';
    throw error;
  }

  if (factura.estado === 'ANULADA') {
    const error = new Error('Esta factura ya se encuentra anulada');
    error.codigo = 'YA_ANULADA';
    throw error;
  }

  if (!motivo || motivo.trim() === '') {
    const error = new Error('El motivo de anulación es obligatorio');
    error.codigo = 'MOTIVO_REQUERIDO';
    throw error;
  }

  factura.estado = 'ANULADA';
  factura.motivoAnulacion = motivo;
  factura.anuladaPor = usuarioId;
  factura.fechaAnulacion = new Date();

  await factura.save();

  return factura;
}

async function listarFacturasPorPaciente(pacienteId) {
  const facturas = await Factura.find({ paciente: pacienteId })
    .populate('creadoPor', 'nombre')
    .populate('pagos.registradoPor', 'nombre')
    .sort({ createdAt: -1 });

  return facturas;
}

module.exports = {
  obtenerTratamientosFacturables,
  crearFactura,
  registrarPago,
  anularFactura,
  listarFacturasPorPaciente,
};