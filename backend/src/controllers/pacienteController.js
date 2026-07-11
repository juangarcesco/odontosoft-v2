const { crearPaciente, listarPacientes, buscarPacientes } = require('../services/pacienteService');

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

module.exports = { crear, listar, buscar };