const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // log de peticiones (base para RNF-06)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OdontoSoft API' });
});

module.exports = app;