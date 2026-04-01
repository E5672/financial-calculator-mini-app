const axios = require('axios');

const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

/**
 * Геокодирование адреса через Яндекс.Геокодер
 */
async function geocodeAddress(address) {
  if (!YANDEX_API_KEY) {
    throw new Error('YANDEX_API_KEY не установлен в .env файле');
  }

  const url = 'https://geocode-maps.yandex.ru/1.x/';
  const params = {
    apikey: YANDEX_API_KEY,
    geocode: address,
    format: 'json',
    lang: 'ru_RU',
    results: 5,
  };

  const response = await axios.get(url, { params });
  const collection = response.data?.response?.GeoObjectCollection;

  if (!collection || collection.featureMember.length === 0) {
    throw new Error(`Адрес не найден: "${address}"`);
  }

  return collection.featureMember.map(item => {
    const obj = item.GeoObject;
    const [lng, lat] = obj.Point.pos.split(' ').map(Number);
    return {
      name: obj.name,
      description: obj.description,
      fullAddress: `${obj.name}, ${obj.description}`,
      lat,
      lng,
    };
  });
}

/**
 * Автоподсказки адресов (suggestAPI)
 * Используем геокодер с ограниченным числом результатов
 */
async function suggestAddresses(query) {
  if (!YANDEX_API_KEY || query.length < 3) return [];

  try {
    const url = 'https://geocode-maps.yandex.ru/1.x/';
    const params = {
      apikey: YANDEX_API_KEY,
      geocode: query,
      format: 'json',
      lang: 'ru_RU',
      results: 7,
      kind: 'locality,street,house,metro,district',
      rspn: 0,
    };

    const response = await axios.get(url, { params });
    const members = response.data?.response?.GeoObjectCollection?.featureMember || [];

    return members.map(item => {
      const obj = item.GeoObject;
      const [lng, lat] = obj.Point.pos.split(' ').map(Number);
      return {
        value: `${obj.name}, ${obj.description}`,
        name: obj.name,
        description: obj.description,
        lat,
        lng,
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Построение маршрута через Яндекс Router API
 */
async function buildRoute(waypoints, options = {}) {
  if (!YANDEX_API_KEY) {
    throw new Error('YANDEX_API_KEY не установлен в .env файле');
  }

  const {
    avoidTolls = false,
    truckMode = true,
    preferHighways = true,
  } = options;

  // Яндекс Router API
  const url = 'https://api.routing.yandex.net/v2/route';

  const waypointsStr = waypoints
    .map(wp => `${wp.lng},${wp.lat}`)
    .join('|');

  const params = {
    apikey: YANDEX_API_KEY,
    waypoints: waypointsStr,
    mode: truckMode ? 'truck' : 'driving',
    lang: 'ru_RU',
    avoid_tolls: avoidTolls ? 1 : 0,
  };

  try {
    const response = await axios.get(url, { params });
    const route = response.data;

    if (!route || !route.route) {
      throw new Error('Маршрут не найден');
    }

    const legs = route.route.legs || [];
    const segments = legs.map((leg, idx) => ({
      index: idx,
      distanceM: leg.distance?.value || 0,
      distanceKm: Math.round((leg.distance?.value || 0) / 1000),
      durationSec: leg.duration?.value || 0,
      durationMin: Math.round((leg.duration?.value || 0) / 60),
      steps: leg.steps || [],
    }));

    const totalDistanceM = segments.reduce((sum, s) => sum + s.distanceM, 0);
    const totalDurationSec = segments.reduce((sum, s) => sum + s.durationSec, 0);

    return {
      segments,
      totalDistanceKm: Math.round(totalDistanceM / 1000),
      totalDurationMin: Math.round(totalDurationSec / 60),
      geometry: route.route.geometry || null,
    };
  } catch (err) {
    // Fallback: расчет по прямой (Haversine) если API недоступен
    console.warn('Router API недоступен, используем расчет по прямой:', err.message);
    return buildRouteFallback(waypoints);
  }
}

/**
 * Fallback: расчет расстояния по формуле Haversine
 */
function buildRouteFallback(waypoints) {
  const segments = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const distanceKm = Math.round(haversineKm(from.lat, from.lng, to.lat, to.lng) * 1.25);
    segments.push({
      index: i,
      distanceM: distanceKm * 1000,
      distanceKm,
      durationSec: Math.round(distanceKm / 70 * 3600),
      durationMin: Math.round(distanceKm / 70 * 60),
      steps: [],
      isFallback: true,
    });
  }

  const totalDistanceKm = segments.reduce((sum, s) => sum + s.distanceKm, 0);
  const totalDurationMin = segments.reduce((sum, s) => sum + s.durationMin, 0);

  return {
    segments,
    totalDistanceKm,
    totalDurationMin,
    geometry: null,
    isFallback: true,
  };
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { geocodeAddress, suggestAddresses, buildRoute, buildRouteFallback, haversineKm };
