const express = require('express');
const { crear, obtenerPorPaciente } = require('../controllers/historiaClinicaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// RN-03: solo ODONTOLOGO crea/edita contenido clínico
router.post('/', verificarToken, permitirRoles('ODONTOLOGO'), crear);

// ADMIN y ODONTOLOGO pueden ver (RECEPCIONISTA sin acceso, según matriz)
router.get('/paciente/:pacienteId', verificarToken, permitirRoles('ADMIN', 'ODONTOLOGO'), obtenerPorPaciente);

module.exports = router;