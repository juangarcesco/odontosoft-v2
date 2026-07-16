const {
  obtenerTratamientosFacturables,
  crearFactura,
  registrarPago,
  anularFactura,
  listarFacturasPorPaciente,
} = require('../services/facturaService');

async function tratamientosFacturables(req, res) {
  try {
    const { pacienteId } = req.params;
    const tratamientos = await obtenerTratamientosFacturables(pacienteId);
    return res.status(200).json({ tratamientos });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al obtener tratamientos facturables:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function crear(req, res) {
  try {
    const { pacienteId, items } = req.body;
    const factura = await crearFactura(pacienteId, items, req.usuario.id);
    return res.status(201).json({ mensaje: 'Factura creada exitosamente', factura });
  } catch (error) {
    if (error.codigo === 'SIN_ITEMS') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al crear factura:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function pagar(req, res) {
  try {
    const { id } = req.params;
    const { monto, metodoPago } = req.body;

    const factura = await registrarPago(id, monto, metodoPago, req.usuario.id);
    return res.status(200).json({ mensaje: 'Pago registrado exitosamente', factura });
  } catch (error) {
    if (error.codigo === 'METODO_INVALIDO' || error.codigo === 'MONTO_EXCEDE_SALDO') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.codigo === 'FACTURA_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.codigo === 'FACTURA_ANULADA') {
      return res.status(409).json({ mensaje: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de factura inválido' });
    }
    console.error('Error al registrar pago:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function anular(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const factura = await anularFactura(id, motivo, req.usuario.id);
    return res.status(200).json({ mensaje: 'Factura anulada exitosamente', factura });
  } catch (error) {
    if (error.codigo === 'FACTURA_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.codigo === 'YA_ANULADA' || error.codigo === 'MOTIVO_REQUERIDO') {
      return res.status(error.codigo === 'YA_ANULADA' ? 409 : 400).json({ mensaje: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de factura inválido' });
    }
    console.error('Error al anular factura:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function listarPorPaciente(req, res) {
  try {
    const { pacienteId } = req.params;
    const facturas = await listarFacturasPorPaciente(pacienteId);
    return res.status(200).json({ facturas });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al listar facturas:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { tratamientosFacturables, crear, pagar, anular, listarPorPaciente };