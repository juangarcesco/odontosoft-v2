const express = require('express');
const { crear, listar, entrada } = require('../controllers/materialController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Solo RECEPCIONISTA gestiona inventario (matriz de permisos del SRS)
router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);

router.patch('/:id/entrada', verificarToken, permitirRoles('RECEPCIONISTA'), entrada);


module.exports = router;