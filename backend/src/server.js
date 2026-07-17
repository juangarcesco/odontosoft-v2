require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { iniciarJobRecordatorios } = require('./jobs/recordatoriosJob');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    iniciarJobRecordatorios();
  });
});