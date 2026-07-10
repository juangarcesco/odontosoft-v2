const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12; // RNF-01: costo de hash robusto

async function hashPassword(passwordPlano) {
  return bcrypt.hash(passwordPlano, SALT_ROUNDS);
}

async function compararPassword(passwordPlano, passwordHash) {
  return bcrypt.compare(passwordPlano, passwordHash);
}

module.exports = { hashPassword, compararPassword };