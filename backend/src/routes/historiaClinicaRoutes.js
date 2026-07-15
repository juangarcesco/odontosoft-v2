const express = require('express');

const {
  crear,
  obtenerPorPaciente,
  actualizarOdontograma,
  crearEvolucion,
  editarAntecedentes,
} = require('../controllers/historiaClinicaController');

const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// RN-03: solo ODONTOLOGO crea/edita contenido clínico
router.post('/', verificarToken, permitirRoles('ODONTOLOGO'), crear);

// ADMIN y ODONTOLOGO pueden ver (RECEPCIONISTA sin acceso, según matriz)
router.get('/paciente/:pacienteId', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO'), obtenerPorPaciente);

// RN-03: solo ODONTOLOGO edita contenido clínico
router.patch(
  '/paciente/:pacienteId/odontograma/:numeroDiente',
  verificarToken,
  permitirRoles('ODONTOLOGO'),
  actualizarOdontograma
);

// RN-03: solo ODONTOLOGO crea evoluciones; RN-09: se registra automáticamente quién y cuándo
router.post(
  '/paciente/:pacienteId/evoluciones',
  verificarToken,
  permitirRoles('ODONTOLOGO'),
  crearEvolucion
);

router.patch(
  '/paciente/:pacienteId/antecedentes',
  verificarToken,
  permitirRoles('ODONTOLOGO'),
  editarAntecedentes
);

module.exports = router;