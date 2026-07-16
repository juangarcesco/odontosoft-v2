const express = require('express');
const { upload } = require('../middlewares/uploadMiddleware');
const {
  crear,
  obtenerPorPaciente,
  actualizarOdontograma,
  crearEvolucion,
  editarAntecedentes,
  desactivarEvolucionClinica,
  subirAdjunto,
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

// RN-10: única acción de ADMIN sobre historia clínica — desactivar, nunca editar
router.patch(
  '/paciente/:pacienteId/evoluciones/:evolucionId/desactivar',
  verificarToken,
  permitirRoles('ADMIN'),
  desactivarEvolucionClinica
);

// RF-30: adjuntar imágenes es contenido clínico, exclusivo de ODONTOLOGO (RN-03)
router.post(
  '/paciente/:pacienteId/adjuntos',
  verificarToken,
  permitirRoles('ODONTOLOGO'),
  upload.single('archivo'),
  subirAdjunto
);

module.exports = router;