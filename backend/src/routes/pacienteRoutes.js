const express = require('express');
const { crear, listar, buscar, obtenerDetalle } = require('../controllers/pacienteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), crear);

// Los 3 roles pueden listar/consultar pacientes

router.get('/buscar', verificarToken, buscar);

router.get('/:id', verificarToken, obtenerDetalle);

module.exports = router;