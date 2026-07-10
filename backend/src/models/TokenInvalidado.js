const mongoose = require('mongoose');

const tokenInvalidadoSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiraEn: {
    type: Date,
    required: true,
  },
});

// TTL index: Mongo borra el documento automáticamente cuando expiraEn ya pasó
tokenInvalidadoSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenInvalidado', tokenInvalidadoSchema);