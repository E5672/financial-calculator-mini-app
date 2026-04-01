const { PLATON_RATES, FEDERAL_HIGHWAY_RATIO } = require('../data/tollRoads');

/**
 * Система "Платон" - плата за проезд грузовиков >12 тонн по федеральным трассам
 * Постановление Правительства РФ № 1191 от 14.11.2014
 */

/**
 * Рассчитать стоимость Платона
 * @param {number} totalDistanceKm - общее расстояние маршрута
 * @param {number} customRate - кастомный тариф (если не задан, используется текущий)
 * @param {number} federalRatioOverride - ручное указание % федеральных трасс (0-1)
 */
function calculatePlaton(totalDistanceKm, customRate = null, federalRatioOverride = null) {
  const rate = customRate || PLATON_RATES.current;

  let federalRatio;
  if (federalRatioOverride !== null) {
    federalRatio = federalRatioOverride;
  } else {
    // Определяем соотношение федеральных трасс по дистанции
    const range = FEDERAL_HIGHWAY_RATIO.ranges.find(
      r => totalDistanceKm >= r.minKm && totalDistanceKm < r.maxKm
    );
    federalRatio = range ? range.ratio : 0.5;
  }

  const federalKm = Math.round(totalDistanceKm * federalRatio);
  const cost = Math.round(federalKm * rate * 100) / 100;

  return {
    totalDistanceKm,
    federalRatio,
    federalKm,
    rate,
    cost,
    rateInfo: {
      current: PLATON_RATES.current,
      description: 'Постановление Правительства РФ № 1191',
      unit: 'руб/км',
    },
  };
}

/**
 * Получить актуальный тариф Платона
 */
function getCurrentPlatonRate() {
  return PLATON_RATES.current;
}

/**
 * Все доступные тарифы (для UI)
 */
function getAllPlatonRates() {
  return PLATON_RATES;
}

module.exports = { calculatePlaton, getCurrentPlatonRate, getAllPlatonRates };
