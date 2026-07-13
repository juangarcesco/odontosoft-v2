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

router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);

// ADMIN y ODONTOLOGO tienen solo lectura; RECEPCIONISTA tiene CRUD completo
router.get('/', verificarToken, listar);
router.get('/buscar', verificarToken, buscar);
router.get('/:id', verificarToken, obtenerDetalle);

router.put('/:id', verificarToken, permitirRoles('RECEPCIONISTA'), actualizar);

router.patch('/:id/desactivar', verificarToken, permitirRoles('RECEPCIONISTA'), desactivar);

module.exports = router;