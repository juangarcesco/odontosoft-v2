const express = require('express');
const {
  crear,
  listar,
  buscar,
  obtenerDetalle,
  actualizar,
  desactivar,
} = require('../controllers/pacienteController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), crear);

// Los 3 roles pueden listar/consultar pacientes
router.get('/', verificarToken, listar);

router.get('/buscar', verificarToken, buscar);

router.get('/:id', verificarToken, obtenerDetalle);

router.put('/:id', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), actualizar);

router.patch('/:id/desactivar', verificarToken, permitirRoles('ADMIN', 'RECEPCIONISTA'), desactivar);

module.exports = router;