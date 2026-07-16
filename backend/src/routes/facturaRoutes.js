const express = require('express');
const { tratamientosFacturables } = require('../controllers/facturaController');
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

module.exports = router;