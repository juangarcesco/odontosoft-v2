const express = require('express');
const { obtenerConfig, actualizarConfig, ejecutarEnvio } = require('../controllers/recordatorioController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/configuracion', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), obtenerConfig);
router.put('/configuracion', verificarToken, permitirRoles('RECEPCIONISTA'), actualizarConfig);
router.post('/ejecutar', verificarToken, permitirRoles('RECEPCIONISTA'), ejecutarEnvio);

module.exports = router;