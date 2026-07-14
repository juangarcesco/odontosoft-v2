const express = require('express');
const { odontologos } = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/odontologos', verificarToken, permitirRoles('RECEPCIONISTA'), odontologos);

module.exports = router;