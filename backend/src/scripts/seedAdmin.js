require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const { hashPassword } = require('../services/authService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const existe = await Usuario.findOne({ email: 'admin@odontosoft.com' });
  if (existe) {
    console.log('El admin ya existe, no se crea de nuevo.');
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword('Admin123!');

  const admin = await Usuario.create({
    nombre: 'Administrador General',
    email: 'admin@odontosoft.com',
    passwordHash,
    rol: 'ADMIN',
  });

  console.log('Admin creado:', admin.toJSON());
  await mongoose.disconnect();
}

run();