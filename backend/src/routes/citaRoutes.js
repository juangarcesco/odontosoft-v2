const express = require('express');
const { crear, listar, cambiarEstado } = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Solo RECEPCIONISTA tiene CRUD sobre citas (matriz de permisos del SRS)
router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);

router.get('/', verificarToken, listar);

// RECEPCIONISTA y ODONTOLOGO pueden actualizar el estado (según matriz de permisos)
router.patch('/:id/estado', verificarToken, permitirRoles('RECEPCIONISTA', 'ODONTOLOGO'), cambiarEstado);

module.exports = router;