const Usuario = require('../models/Usuario');

async function listarOdontologos() {
  return Usuario.find({ rol: 'ODONTOLOGO', estado: 'ACTIVO' }).select('nombre email');
}

module.exports = { listarOdontologos };