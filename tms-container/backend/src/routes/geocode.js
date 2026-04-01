const express = require('express');
const router = express.Router();
const { suggestAddresses, geocodeAddress } = require('../services/routingService');

// Автоподсказки адресов
router.get('/suggest', async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const suggestions = await suggestAddresses(q);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Геокодирование адреса
router.get('/geocode', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Параметр address обязателен' });
  }

  try {
    const results = await geocodeAddress(address);
    res.json({ results });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
