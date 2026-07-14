const express = require('express');
const { crear, listar, cambiarEstado, editar } = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Solo RECEPCIONISTA tiene CRUD sobre citas (matriz de permisos del SRS)
router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);

router.get('/', verificarToken, listar);

// RECEPCIONISTA y ODONTOLOGO pueden actualizar el estado (según matriz de permisos)
router.patch('/:id/estado', verificarToken, permitirRoles('RECEPCIONISTA', 'ODONTOLOGO'), cambiarEstado);

// Solo RECEPCIONISTA edita los datos de la cita (según matriz de permisos)
router.put('/:id', verificarToken, permitirRoles('RECEPCIONISTA'), editar);

module.exports = router;