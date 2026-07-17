const Material = require('../models/Material');

async function crearMaterial(datos, usuarioId) {
  const material = await Material.create({
    ...datos,
    creadoPor: usuarioId,
  });
  return material;
}

async function listarMateriales() {
  const materiales = await Material.find({ estado: 'ACTIVO' }).sort({ nombre: 1 });

  return materiales.map((material) => ({
    ...material.toObject(),
    stockBajo: material.stock <= material.stockMinimo,
  }));
}

async function registrarEntrada(materialId, cantidad, motivo, usuarioId) {
  if (!cantidad || cantidad <= 0) {
    const error = new Error('La cantidad debe ser mayor a cero');
    error.codigo = 'CANTIDAD_INVALIDA';
    throw error;
  }

  const material = await Material.findById(materialId);

  if (!material) {
    const error = new Error('Material no encontrado');
    error.codigo = 'MATERIAL_NO_EXISTE';
    throw error;
  }

  material.movimientos.push({
    tipo: 'ENTRADA',
    cantidad,
    motivo: motivo || '',
    registradoPor: usuarioId,
  });

  material.stock = material.stock + cantidad;

  await material.save();

  return material;
}

module.exports = { crearMaterial, listarMateriales, registrarEntrada };