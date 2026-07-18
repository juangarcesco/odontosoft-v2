const Factura = require('../models/Factura');
const Paciente = require('../models/Paciente');
const ArchivoRips = require('../models/ArchivoRips');

function calcularRangoPeriodo(periodo) {
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

async function generarEstructuraRips(periodo) {
  const { fechaInicio, fechaFin } = calcularRangoPeriodo(periodo);

  const facturas = await Factura.find({
    createdAt: { $gte: fechaInicio, $lte: fechaFin },
    estado: { $ne: 'ANULADA' },
  }).populate('paciente', 'tipoDocumento numeroDocumento nombre apellido fechaNacimiento sexo');

  const incompletas = [];
  const usuarios = [];

  facturas.forEach((factura) => {
    const camposFaltantes = validarCamposObligatorios(factura, factura.paciente);

    if (camposFaltantes.length > 0) {
      incompletas.push({ facturaId: factura._id.toString(), camposFaltantes });
      return;
    }

    const procedimientos = factura.items.map((item) => ({
      codPrestador: 'PENDIENTE_HABILITACION',
      fechaAtencion: factura.createdAt.toISOString().substring(0, 10),
      codProcedimiento: item.codigoCups,
      diagnosticoPrincipal: item.diagnostico,
      valorProcedimiento: item.valor,
    }));

    usuarios.push({
      tipoDocumentoIdentificacion: factura.paciente.tipoDocumento,
      numDocumentoIdentificacion: factura.paciente.numeroDocumento,
      fechaNacimiento: factura.paciente.fechaNacimiento
        ? factura.paciente.fechaNacimiento.toISOString().substring(0, 10)
        : null,
      codSexo: factura.paciente.sexo,
      servicios: {
        procedimientos,
      },
    });
  });

  const estructura = {
    numDocumentoIdObligado: 'PENDIENTE',
    numFactura: null,
    tipoNota: null,
    numNota: null,
    usuarios,
  };

  return { estructura, incompletas };
}

async function generarYRegistrarRips(periodo, usuarioId) {
  const { estructura, incompletas } = await generarEstructuraRips(periodo);

  if (incompletas.length > 0) {
    const error = new Error(
      `No se puede generar el RIPS: ${incompletas.length} atención(es) con datos incompletos`
    );
    error.codigo = 'ATENCIONES_INCOMPLETAS';
    error.incompletas = incompletas;
    throw error;
  }

  if (estructura.usuarios.length === 0) {
    const error = new Error('No hay atenciones completas para generar el RIPS de este periodo');
    error.codigo = 'SIN_ATENCIONES';
    throw error;
  }

  const { fechaInicio, fechaFin } = calcularRangoPeriodo(periodo);

  const facturasDelPeriodo = await Factura.find({
    createdAt: { $gte: fechaInicio, $lte: fechaFin },
    estado: { $ne: 'ANULADA' },
  }).select('_id');

  const archivo = await ArchivoRips.create({
    periodo,
    fechaInicio,
    fechaFin,
    facturasIncluidas: facturasDelPeriodo.map((f) => f._id),
    cantidadAtenciones: estructura.usuarios.length,
    generadoPor: usuarioId,
  });

  return { estructura, archivo };
}

async function listarArchivosRips() {
  const archivos = await ArchivoRips.find()
    .populate('generadoPor', 'nombre')
    .sort({ createdAt: -1 });

  return archivos;
}

module.exports = {
  calcularRangoPeriodo,
  validarCamposObligatorios,
  validarPeriodo,
  generarEstructuraRips,
  generarYRegistrarRips,
  listarArchivosRips,
};