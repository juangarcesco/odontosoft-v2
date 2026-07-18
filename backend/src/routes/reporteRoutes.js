const express = require('express');
const {
  ingresos,
  pacientesNuevos,
  tratamientosMasRealizados,
  saldoPendiente,
  tasaAsistencia,
  exportarExcel,
  exportarPdf,
} = require('../controllers/reporteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/ingresos', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), ingresos);
router.get('/saldo-pendiente', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), saldoPendiente);
router.get('/pacientes-nuevos', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), pacientesNuevos);
router.get('/tasa-asistencia', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), tasaAsistencia);
router.get('/tratamientos', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO'), tratamientosMasRealizados);

router.get('/:tipo/excel', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'), exportarExcel);
router.get('/:tipo/pdf', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'), exportarPdf);

module.exports = router;