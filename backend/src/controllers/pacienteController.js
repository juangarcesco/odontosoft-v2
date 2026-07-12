const {
  crearPaciente,
  listarPacientes,
  buscarPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  desactivarPaciente,
} = require('../services/pacienteService');

async function crear(req, res) {
  try {
    const paciente = await crearPaciente(req.body, req.usuario.id);
    return res.status(201).json({
      mensaje: 'Paciente registrado exitosamente',
      paciente,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ya existe un paciente con ese tipo y número de documento',
      });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    console.error('Error al crear paciente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function listar(req, res) {
  try {
    const { pagina, limite } = req.query;
    const resultado = await listarPacientes({ pagina, limite });
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function buscar(req, res) {
  try {
    const { q } = req.query;
    const pacientes = await buscarPacientes(q);
    return res.status(200).json({ pacientes });
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function obtenerDetalle(req, res) {
  try {
    const { id } = req.params;
    const paciente = await obtenerPacientePorId(id);

    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }

    return res.status(200).json({ paciente });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al obtener detalle de paciente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function actualizar(req, res) {
  try {
    const { id } = req.params;
    const paciente = await actualizarPaciente(id, req.body);

    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }

    return res.status(200).json({
      mensaje: 'Paciente actualizado exitosamente',
      paciente,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        mensaje: 'Ya existe otro paciente con ese tipo y número de documento',
      });
    }
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    }
    console.error('Error al actualizar paciente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

async function desactivar(req, res) {
  try {
    const { id } = req.params;
    const paciente = await desactivarPaciente(id);

    if (!paciente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }

    return res.status(200).json({
      mensaje: 'Paciente desactivado exitosamente',
      paciente,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: 'ID de paciente inválido' });
    }
    console.error('Error al desactivar paciente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = { crear, listar, buscar, obtenerDetalle, actualizar, desactivar };