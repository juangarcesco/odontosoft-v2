require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const { hashPassword } = require('../services/authService');

const usuariosPrueba = [
  {
    nombre: 'Dr. Odontólogo Prueba',
    email: 'odontologo@odontosoft.com',
    password: 'Odonto123!',
    rol: 'ODONTOLOGO',
  },
  {
    nombre: 'Recepcionista Prueba',
    email: 'recepcion@odontosoft.com',
    password: 'Recepcion123!',
    rol: 'RECEPCIONISTA',
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const u of usuariosPrueba) {
    const existe = await Usuario.findOne({ email: u.email });
    if (existe) {
      console.log(`Ya existe: ${u.email}`);
      continue;
    }
    const passwordHash = await hashPassword(u.password);
    const creado = await Usuario.create({
      nombre: u.nombre,
      email: u.email,
      passwordHash,
      rol: u.rol,
    });
    console.log('Creado:', creado.toJSON());
  }

  await mongoose.disconnect();
}

run();