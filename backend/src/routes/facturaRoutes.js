const express = require('express');
const { tratamientosFacturables, crear, pagar } = require('../controllers/facturaController');
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

router.patch('/:id/pagar', verificarToken, permitirRoles('RECEPCIONISTA'), pagar);

module.exports = router;