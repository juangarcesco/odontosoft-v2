const express = require('express');
const { crear, listar, buscar, obtenerDetalle, actualizar } = require('../controllers/pacienteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), crear);

// Los 3 roles pueden listar/consultar pacientes

router.get('/buscar', verificarToken, buscar);

router.get('/:id', verificarToken, obtenerDetalle);

router.put('/:id', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), actualizar);

module.exports = router;