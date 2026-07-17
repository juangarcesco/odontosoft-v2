const express = require('express');
const { crear, listar, entrada, salida, actualizar } = require('../controllers/materialController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);
router.get('/', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), listar);
router.patch('/:id/entrada', verificarToken, permitirRoles('RECEPCIONISTA'), entrada);
router.patch('/:id/salida', verificarToken, permitirRoles('RECEPCIONISTA'), salida);
router.put('/:id', verificarToken, permitirRoles('RECEPCIONISTA'), actualizar);

module.exports = router;