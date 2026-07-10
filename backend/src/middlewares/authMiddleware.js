const jwt = require('jsonwebtoken');
const TokenInvalidado = require('../models/TokenInvalidado');

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const invalidado = await TokenInvalidado.findOne({ token });
    if (invalidado) {
      return res.status(401).json({ mensaje: 'Sesión cerrada, inicie sesión nuevamente' });
    }

    req.usuario = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Sesión expirada, inicie sesión nuevamente' });
    }
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

module.exports = { verificarToken };