const express = require('express');
const router = express.Router();
const { buildRoute } = require('../services/routingService');
const { calculateTolls } = require('../services/tollCalculator');
const { calculatePlaton, getCurrentPlatonRate } = require('../services/platoCalculator');
const { calculateEconomics, getDefaults } = require('../services/costCalculator');

/**
 * POST /api/route/calculate
 * Основной эндпоинт расчета рейса
 */
router.post('/calculate', async (req, res) => {
  try {
    const {
      // Точки маршрута
      pointLoading,    // Пункт постановки контейнера
      pointUnloading,  // Пункт выгрузки
      pointReturn,     // Пункт сдачи контейнера

      // Настройки маршрута
      avoidTolls = false,
      truckRestrictions = true,
      preferHighways = true,

      // Экономика
      ratePerKm,
      fuelConsumptionPer100km,
      fuelPricePerLiter,
      platonRate,
      driverDailyRate,
      otherExpenses,
    } = req.body;

    // Валидация
    if (!pointLoading || !pointUnloading || !pointReturn) {
      return res.status(400).json({
        error: 'Необходимо указать все три точки маршрута'
      });
    }

    if (!pointLoading.lat || !pointLoading.lng ||
        !pointUnloading.lat || !pointUnloading.lng ||
        !pointReturn.lat || !pointReturn.lng) {
      return res.status(400).json({
        error: 'Координаты точек маршрута не определены'
      });
    }

    const waypoints = [
      { ...pointLoading, name: pointLoading.address || 'Точка загрузки' },
      { ...pointUnloading, name: pointUnloading.address || 'Точка выгрузки' },
      { ...pointReturn, name: pointReturn.address || 'Точка сдачи' },
    ];

    // 1. Построить маршрут
    const routeResult = await buildRoute(waypoints, {
      avoidTolls,
      truckMode: truckRestrictions,
      preferHighways,
    });

    // 2. Рассчитать платные дороги
    const tollResult = calculateTolls(waypoints, routeResult.totalDistanceKm, avoidTolls);

    // 3. Рассчитать Платон
    const platonResult = calculatePlaton(
      routeResult.totalDistanceKm,
      platonRate || null,
    );

    // 4. Рассчитать экономику
    const economics = calculateEconomics({
      totalDistanceKm: routeResult.totalDistanceKm,
      ratePerKm: ratePerKm || undefined,
      fuelConsumptionPer100km: fuelConsumptionPer100km || undefined,
      fuelPricePerLiter: fuelPricePerLiter || undefined,
      tollCost: tollResult.totalCost,
      platonCost: platonResult.cost,
      driverDailyRate: driverDailyRate || undefined,
      otherExpenses: otherExpenses || 0,
    });

    // Формируем сегменты для UI
    const segments = routeResult.segments.map((seg, idx) => ({
      index: idx,
      from: waypoints[idx]?.name || `Точка ${idx + 1}`,
      to: waypoints[idx + 1]?.name || `Точка ${idx + 2}`,
      distanceKm: seg.distanceKm,
      durationMin: seg.durationMin,
    }));

    res.json({
      success: true,
      isFallback: routeResult.isFallback || false,

      route: {
        segments,
        totalDistanceKm: routeResult.totalDistanceKm,
        totalDurationMin: routeResult.totalDurationMin,
        waypoints,
      },

      tolls: tollResult,
      platon: platonResult,
      economics,

      defaults: getDefaults(),
      platonRate: getCurrentPlatonRate(),
    });

  } catch (err) {
    console.error('Ошибка расчета рейса:', err);
    res.status(500).json({
      error: 'Ошибка расчета маршрута',
      details: err.message,
    });
  }
});

// GET /api/route/defaults - получить дефолтные параметры
router.get('/defaults', (req, res) => {
  res.json({
    ...getDefaults(),
    platonRate: getCurrentPlatonRate(),
  });
});

module.exports = router;
