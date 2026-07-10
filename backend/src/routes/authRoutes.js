const express = require('express');
const { login, logout } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', verificarToken, logout);

router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso concedido', usuario: req.usuario });
});

router.get('/solo-admin', verificarToken, permitirRoles('ADMIN'), (req, res) => {
  res.json({ mensaje: 'Bienvenido, administrador' });
});

module.exports = router;