const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');

const app = express();

app.set('trust proxy', 1); // necesario en Codespaces / detrás de proxy

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/pacientes', pacienteRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OdontoSoft API' });
});

app.use('/api/auth', authRoutes);

module.exports = app;