const express = require('express');

const {
  tratamientosFacturables,
  crear,
  pagar,
  anular,
  listarPorPaciente,
  descargarPdf,
} = require('../controllers/facturaController');

const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Solo RECEPCIONISTA gestiona facturación (matriz de permisos del SRS)
router.get(
  '/tratamientos-facturables/:pacienteId',
  verificarToken,
  permitirRoles('RECEPCIONISTA'),
  tratamientosFacturables
);

router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);

// Lectura: ADMIN, ODONTOLOGO y RECEPCIONISTA pueden consultar el historial
router.get(
  '/paciente/:pacienteId',
  verificarToken,
  permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'),
  listarPorPaciente
);

router.patch('/:id/pagar', verificarToken, permitirRoles('RECEPCIONISTA'), pagar);

router.patch('/:id/anular', verificarToken, permitirRoles('RECEPCIONISTA'), anular);

// Lectura de PDF: mismos permisos que consultar el historial
router.get(
  '/:id/pdf',
  verificarToken,
  permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'),
  descargarPdf
);

module.exports = router;