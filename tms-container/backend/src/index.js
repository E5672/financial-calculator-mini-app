require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routeRouter = require('./routes/route');
const geocodeRouter = require('./routes/geocode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/route', routeRouter);
app.use('/api/geocode', geocodeRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера', details: err.message });
});

app.listen(PORT, () => {
  console.log(`TMS Backend запущен на порту ${PORT}`);
});
