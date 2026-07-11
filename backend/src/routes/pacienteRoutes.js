const express = require('express');
const { crear } = require('../controllers/pacienteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Solo ADMIN y RECEPCIONISTA pueden registrar pacientes
router.post('/', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), crear);

module.exports = router;