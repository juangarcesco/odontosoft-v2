const HistoriaClinica = require('../models/HistoriaClinica');
const Factura = require('../models/Factura');
const METODOS_PAGO_VALIDOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];
const PDFDocument = require('pdfkit');


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

async function generarPdfFactura(facturaId) {
  const factura = await Factura.findById(facturaId)
    .populate('paciente', 'nombre apellido tipoDocumento numeroDocumento')
    .populate('creadoPor', 'nombre');

  if (!factura) {
    const error = new Error('Factura no encontrada');
    error.codigo = 'FACTURA_NO_EXISTE';
    throw error;
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const paciente = factura.paciente;

    // Encabezado
    doc.fontSize(18).text('OdontoSoft', { align: 'left' });
    doc.fontSize(10).fillColor('#7f8c8d').text('Factura de servicios odontológicos', { align: 'left' });
    doc.moveDown();

    // Datos de la factura
    doc.fillColor('#000000').fontSize(11);
    doc.text(`Factura N°: ${factura._id}`);
    doc.text(`Fecha de emisión: ${factura.createdAt.toLocaleDateString('es-CO')}`);
    doc.text(`Estado: ${factura.estado}`);
    doc.moveDown();

    doc.text(`Paciente: ${paciente.nombre} ${paciente.apellido}`);
    doc.text(`Documento: ${paciente.tipoDocumento} ${paciente.numeroDocumento}`);
    doc.moveDown();

    // Tabla de ítems
    doc.fontSize(12).text('Tratamientos realizados', { underline: true });
    doc.moveDown(0.5);

    factura.items.forEach((item) => {
      const dienteTexto = item.diente ? `Diente ${item.diente} — ` : '';
      doc.fontSize(10).text(
        `${dienteTexto}${item.procedimiento}`,
        { continued: true, width: 350 }
      );
      doc.text(`$${item.valor.toLocaleString('es-CO')}`, { align: 'right' });
    });

    doc.moveDown();
    doc.fontSize(10).text(`IVA: $${factura.iva.toLocaleString('es-CO')}`, { align: 'right' });
    doc.fontSize(12).text(`TOTAL: $${factura.valorTotal.toLocaleString('es-CO')}`, { align: 'right' });
    doc.moveDown(0.5);

    // Historial de pagos
    if (factura.pagos.length > 0) {
      doc.fontSize(12).text('Pagos registrados', { underline: true });
      doc.moveDown(0.3);
      factura.pagos.forEach((pago) => {
        doc.fontSize(9).text(
          `${new Date(pago.fecha).toLocaleDateString('es-CO')} — ${pago.metodoPago} — $${pago.monto.toLocaleString('es-CO')}`
        );
      });
      doc.moveDown();
    }

    doc.fontSize(11).fillColor(factura.saldoPendiente > 0 ? '#e74c3c' : '#27ae60')
      .text(`Saldo pendiente: $${factura.saldoPendiente.toLocaleString('es-CO')}`, { align: 'right' });

    if (factura.estado === 'ANULADA') {
      doc.moveDown();
      doc.fillColor('#e74c3c').fontSize(11).text(
        `** FACTURA ANULADA — Motivo: ${factura.motivoAnulacion} **`,
        { align: 'center' }
      );
    }

    doc.end();
  });
}

module.exports = {
  obtenerTratamientosFacturables,
  crearFactura,
  registrarPago,
  anularFactura,
  listarFacturasPorPaciente,
  generarPdfFactura,
};