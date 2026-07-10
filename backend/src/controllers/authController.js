const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const TokenInvalidado = require('../models/TokenInvalidado');
const LogAcceso = require('../models/LogAcceso');
const { compararPassword } = require('../services/authService');
const { generarToken } = require('../services/tokenService');

async function registrarIntento({ email, exito, motivo, req }) {
  try {
    await LogAcceso.create({
      email,
      exito,
      motivo,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    // Un fallo al registrar el log NUNCA debe bloquear el login real
    console.error('Error al registrar log de acceso:', error);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuario = await Usuario.findOne({ email: emailNormalizado });

    if (!usuario) {
      await registrarIntento({ email: emailNormalizado, exito: false, motivo: 'usuario no existe', req });
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (usuario.estado !== 'ACTIVO') {
      await registrarIntento({ email: emailNormalizado, exito: false, motivo: 'usuario inactivo', req });
      return res.status(403).json({ mensaje: 'Usuario inactivo, contacte al administrador' });
    }

    const passwordValida = await compararPassword(password, usuario.passwordHash);

    if (!passwordValida) {
      await registrarIntento({ email: emailNormalizado, exito: false, motivo: 'contraseña incorrecta', req });
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);

    await registrarIntento({ email: emailNormalizado, exito: true, motivo: 'login exitoso', req });

    return res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuario.toJSON(),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    const payload = jwt.decode(token);

    await TokenInvalidado.create({
      token,
      expiraEn: new Date(payload.exp * 1000),
    });

    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { login, logout };