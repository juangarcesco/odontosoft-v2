const express = require('express');
const {
  crear,
  listar,
  cambiarEstado,
  editar,
  cancelar,
  citasDeHoy,
  obtenerDetalle,
} = require('../controllers/citaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', verificarToken, permitirRoles('RECEPCIONISTA'), crear);
router.get('/', verificarToken, listar);
router.get('/hoy', verificarToken, citasDeHoy);
router.get('/:id', verificarToken, obtenerDetalle);

router.put('/:id', verificarToken, permitirRoles('RECEPCIONISTA'), editar);
router.patch('/:id/estado', verificarToken, permitirRoles('RECEPCIONISTA', 'ODONTOLOGO'), cambiarEstado);
router.patch('/:id/cancelar', verificarToken, permitirRoles('RECEPCIONISTA'), cancelar);

module.exports = router;