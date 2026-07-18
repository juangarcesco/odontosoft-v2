const express = require('express');
const { validar } = require('../controllers/ripsController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/validar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), validar);

module.exports = router;