const { listarOdontologos } = require('../services/usuarioService');

async function odontologos(req, res) {
  try {
    const lista = await listarOdontologos();
    return res.status(200).json({ odontologos: lista });
  } catch (error) {
    console.error('Error al listar odontólogos:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { odontologos };