const express = require('express');
const { validar, generar, listar } = require('../controllers/ripsController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/validar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), validar);
router.post('/generar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), generar);
router.get('/historial', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), listar);

module.exports = router;