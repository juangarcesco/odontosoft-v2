const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  const payload = {
    id: usuario._id,
    rol: usuario.rol,
    nombre: usuario.nombre,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // "8h" según tu .env
  });
}

module.exports = { generarToken };