const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP en esa ventana
  standardHeaders: true, // devuelve info de límite en headers RateLimit-*
  legacyHeaders: false,
  message: {
    mensaje: 'Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.',
  },
});

module.exports = { loginLimiter };