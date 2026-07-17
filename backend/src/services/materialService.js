const Material = require('../models/Material');

async function crearMaterial(datos, usuarioId) {
  const material = await Material.create({
    ...datos,
    creadoPor: usuarioId,
  });
  return material;
}

module.exports = { crearMaterial };