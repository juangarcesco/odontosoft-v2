const express = require('express');
const { login } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/login', login);

// Ruta de prueba: cualquier usuario autenticado
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso concedido', usuario: req.usuario });
});

// Ruta de prueba: solo ADMIN
router.get('/solo-admin', verificarToken, permitirRoles('ADMIN'), (req, res) => {
  res.json({ mensaje: 'Bienvenido, administrador' });
});

module.exports = router;