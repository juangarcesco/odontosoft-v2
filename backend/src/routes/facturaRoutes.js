const express = require('express');

const {
  tratamientosFacturables,
  crear,
  pagar,
  anular,
  listarPorPaciente,
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

module.exports = router;