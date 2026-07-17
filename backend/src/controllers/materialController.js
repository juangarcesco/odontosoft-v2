const { crearMaterial } = require('../services/materialService');

async function crear(req, res) {
  try {
    const material = await crearMaterial(req.body, req.usuario.id);
    return res.status(201).json({ mensaje: 'Material registrado exitosamente', material });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    console.error('Error al crear material:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear };