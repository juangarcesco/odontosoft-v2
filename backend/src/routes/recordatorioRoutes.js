const express = require('express');
const { obtenerConfig, actualizarConfig } = require('../controllers/recordatorioController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/configuracion', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), obtenerConfig);
router.put('/configuracion', verificarToken, permitirRoles('RECEPCIONISTA'), actualizarConfig);

module.exports = router;