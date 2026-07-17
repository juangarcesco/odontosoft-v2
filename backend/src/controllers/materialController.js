const {
  crearMaterial,
  listarMateriales,
  registrarEntrada,
  registrarSalida,
  actualizarMaterial,
} = require('../services/materialService');

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

async function listar(req, res) {
  try {
    const materiales = await listarMateriales();
    return res.status(200).json({ materiales });
  } catch (error) {
    console.error('Error al listar materiales:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function entrada(req, res) {
  try {
    const { id } = req.params;
    const { cantidad, motivo } = req.body;

    const material = await registrarEntrada(id, cantidad, motivo, req.usuario.id);
    return res.status(200).json({ mensaje: 'Entrada registrada exitosamente', material });
  } catch (error) {
    if (error.codigo === 'CANTIDAD_INVALIDA') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.codigo === 'MATERIAL_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de material inválido' });
    }
    console.error('Error al registrar entrada:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function salida(req, res) {
  try {
    const { id } = req.params;
    const { cantidad, motivo } = req.body;

    const material = await registrarSalida(id, cantidad, motivo, req.usuario.id);
    return res.status(200).json({ mensaje: 'Salida registrada exitosamente', material });
  } catch (error) {
    if (error.codigo === 'CANTIDAD_INVALIDA') {
      return res.status(400).json({ mensaje: error.message });
    }
    if (error.codigo === 'STOCK_INSUFICIENTE') {
      return res.status(409).json({ mensaje: error.message });
    }
    if (error.codigo === 'MATERIAL_NO_EXISTE') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de material inválido' });
    }
    console.error('Error al registrar salida:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const material = await actualizarMaterial(id, req.body);

    if (!material) {
      return res.status(404).json({ mensaje: 'Material no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Material actualizado exitosamente', material });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de material inválido' });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    console.error('Error al actualizar material:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear, listar, entrada, salida, actualizar };