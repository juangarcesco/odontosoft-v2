const express = require('express');
const {
  ingresos,
  pacientesNuevos,
  tratamientosMasRealizados,
  saldoPendiente,
  tasaAsistencia,
  exportarExcel,
} = require('../controllers/reporteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Financieros: ADMIN + RECEPCIONISTA
router.get('/ingresos', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), ingresos);
router.get('/saldo-pendiente', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), saldoPendiente);

// Administrativos: ADMIN + RECEPCIONISTA
router.get('/pacientes-nuevos', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), pacientesNuevos);
router.get('/tasa-asistencia', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), tasaAsistencia);

// Clínico: ADMIN + ODONTOLOGO
router.get('/tratamientos', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO'), tratamientosMasRealizados);

router.get('/:tipo/excel', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO', 'RECEPCIONISTA'), exportarExcel);


module.exports = router;