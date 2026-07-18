const Factura = require('../models/Factura');
const Paciente = require('../models/Paciente');
const ArchivoRips = require('../models/ArchivoRips');

function calcularRangoPeriodo(periodo) {
  // periodo en formato "YYYY-MM"
  const [anio, mes] = periodo.split('-').map(Number);
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
  return { fechaInicio, fechaFin };
}

function validarCamposObligatorios(factura, paciente) {
  const camposFaltantes = [];

  if (!paciente || !paciente.tipoDocumento || !paciente.numeroDocumento) {
    camposFaltantes.push('documento del paciente');
  }

  factura.items.forEach((item, index) => {
    if (!item.codigoCups || item.codigoCups.trim() === '') {
      camposFaltantes.push(`ítem ${index + 1}: código CUPS`);
    }
    if (!item.diagnostico || item.diagnostico.trim() === '') {
      camposFaltantes.push(`ítem ${index + 1}: diagnóstico`);
    }
  });

  if (!factura.createdAt) {
    camposFaltantes.push('fecha de atención');
  }

  return camposFaltantes;
}

async function validarPeriodo(periodo) {
  const { fechaInicio, fechaFin } = calcularRangoPeriodo(periodo);

  const facturas = await Factura.find({
    createdAt: { $gte: fechaInicio, $lte: fechaFin },
    estado: { $ne: 'ANULADA' },
  }).populate('paciente', 'tipoDocumento numeroDocumento nombre apellido');

  const completas = [];
  const incompletas = [];

  facturas.forEach((factura) => {
    const camposFaltantes = validarCamposObligatorios(factura, factura.paciente);

    if (camposFaltantes.length === 0) {
      completas.push(factura);
    } else {
      incompletas.push({
        facturaId: factura._id,
        paciente: factura.paciente
          ? `${factura.paciente.nombre} ${factura.paciente.apellido}`
          : 'Paciente no encontrado',
        camposFaltantes,
      });
    }
  });

  return {
    periodo,
    totalFacturas: facturas.length,
    completas: completas.length,
    incompletas,
  };
}

module.exports = { calcularRangoPeriodo, validarCamposObligatorios, validarPeriodo };