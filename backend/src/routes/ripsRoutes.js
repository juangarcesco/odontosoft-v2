const express = require('express');
const { validar, generar } = require('../controllers/ripsController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/validar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), validar);
router.post('/generar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), generar);

module.exports = router;