const Usuario = require('../models/Usuario');
const { compararPassword } = require('../services/authService');
const { generarToken } = require('../services/tokenService');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    // Mensaje genérico a propósito: no revelar si el error fue el email o la contraseña
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ mensaje: 'Usuario inactivo, contacte al administrador' });
    }

    const passwordValida = await compararPassword(password, usuario.passwordHash);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuario.toJSON(), // gracias al transform, no incluye passwordHash
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login };