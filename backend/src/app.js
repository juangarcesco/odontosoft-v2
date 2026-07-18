const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const citaRoutes = require('./routes/citaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const historiaClinicaRoutes = require('./routes/historiaClinicaRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const materialRoutes = require('./routes/materialRoutes');
const recordatorioRoutes = require('./routes/recordatorioRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const ripsRoutes = require('./routes/ripsRoutes');


const app = express();

const path = require('path');

app.set('trust proxy', 1); // necesario en Codespaces / detrás de proxy

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/historias-clinicas', historiaClinicaRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OdontoSoft API' });
});

app.use('/api/auth', authRoutes);

app.use('/api/usuarios', usuarioRoutes);

app.use('/api/facturas', facturaRoutes);

app.use('/api/materiales', materialRoutes);

app.use('/api/recordatorios', recordatorioRoutes);

app.use('/api/reportes', reporteRoutes); 

app.use('/api/rips', ripsRoutes);


module.exports = app;