const { TOLL_ROADS } = require('../data/tollRoads');
const { haversineKm } = require('./routingService');

/**
 * Определяем, проходит ли маршрут через платную дорогу.
 * Используем упрощенный геометрический алгоритм:
 * 1. Проверяем bounds box маршрута
 * 2. Проверяем минимальное расстояние от ключевых точек дороги до маршрута
 */
function isRouteOnTollRoad(fromPoint, toPoint, tollRoad) {
  const { bounds, waypoints } = tollRoad;

  // Bbox маршрута
  const routeMinLat = Math.min(fromPoint.lat, toPoint.lat);
  const routeMaxLat = Math.max(fromPoint.lat, toPoint.lat);
  const routeMinLng = Math.min(fromPoint.lng, toPoint.lng);
  const routeMaxLng = Math.max(fromPoint.lng, toPoint.lng);

  // Проверка пересечения bbox
  const bboxOverlap = !(
    routeMaxLat < bounds.minLat ||
    routeMinLat > bounds.maxLat ||
    routeMaxLng < bounds.minLng ||
    routeMinLng > bounds.maxLng
  );

  if (!bboxOverlap) return false;

  // Проверяем, что хотя бы 2 waypoint дороги находятся "вблизи" линии маршрута
  const THRESHOLD_KM = 50; // км
  let nearbyCount = 0;

  for (const wp of waypoints) {
    const distToRoute = distancePointToSegment(wp.lat, wp.lng, fromPoint.lat, fromPoint.lng, toPoint.lat, toPoint.lng);
    if (distToRoute < THRESHOLD_KM) {
      nearbyCount++;
    }
  }

  return nearbyCount >= 2;
}

/**
 * Расстояние от точки до отрезка (км)
 */
function distancePointToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
  const ab = { lat: bLat - aLat, lng: bLng - aLng };
  const ap = { lat: pLat - aLat, lng: pLng - aLng };
  const ab2 = ab.lat ** 2 + ab.lng ** 2;

  if (ab2 === 0) return haversineKm(pLat, pLng, aLat, aLng);

  const t = Math.max(0, Math.min(1, (ap.lat * ab.lat + ap.lng * ab.lng) / ab2));
  const closestLat = aLat + t * ab.lat;
  const closestLng = aLng + t * ab.lng;

  return haversineKm(pLat, pLng, closestLat, closestLng);
}

/**
 * Рассчитать стоимость платных дорог для маршрута
 * @param {Array} waypoints - массив [{lat, lng, name}]
 * @param {number} totalDistanceKm - общее расстояние маршрута
 * @param {boolean} avoidTolls - избегать платных
 */
function calculateTolls(waypoints, totalDistanceKm, avoidTolls = false) {
  if (avoidTolls) {
    return {
      roads: [],
      totalCost: 0,
      avoidTolls: true,
    };
  }

  const foundTolls = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const segmentKm = haversineKm(from.lat, from.lng, to.lat, to.lng) * 1.25;

    for (const toll of TOLL_ROADS) {
      if (isRouteOnTollRoad(from, to, toll)) {
        // Оцениваем процент маршрута, который идет по этой дороге
        const overlapRatio = estimateOverlapRatio(from, to, toll);
        const estimatedKm = Math.round(segmentKm * overlapRatio);

        if (estimatedKm >= toll.minKm) {
          const cost = Math.round(estimatedKm * toll.truckRatePerKm);

          // Не добавлять дубликаты
          const existing = foundTolls.find(t => t.id === toll.id);
          if (!existing) {
            foundTolls.push({
              id: toll.id,
              name: toll.name,
              highway: toll.highway,
              description: toll.description,
              estimatedKm,
              ratePerKm: toll.truckRatePerKm,
              cost,
              segments: toll.segments,
            });
          }
        }
      }
    }
  }

  const totalCost = foundTolls.reduce((sum, t) => sum + t.cost, 0);

  return {
    roads: foundTolls,
    totalCost,
    avoidTolls: false,
  };
}

/**
 * Оценка процента пересечения с платной дорогой
 */
function estimateOverlapRatio(from, to, tollRoad) {
  const routeKm = haversineKm(from.lat, from.lng, to.lat, to.lng) * 1.25;
  const tollLength = tollRoad.segments.reduce((sum, s) => sum + s.km, 0);

  // Используем bbox пересечение для оценки
  const routeLatSpan = Math.abs(to.lat - from.lat);
  const routeLngSpan = Math.abs(to.lng - from.lng);
  const tollLatSpan = tollRoad.bounds.maxLat - tollRoad.bounds.minLat;
  const tollLngSpan = tollRoad.bounds.maxLng - tollRoad.bounds.minLng;

  const overlapLat = Math.max(0, Math.min(
    Math.max(from.lat, to.lat),
    tollRoad.bounds.maxLat
  ) - Math.max(
    Math.min(from.lat, to.lat),
    tollRoad.bounds.minLat
  ));

  const overlapLng = Math.max(0, Math.min(
    Math.max(from.lng, to.lng),
    tollRoad.bounds.maxLng
  ) - Math.max(
    Math.min(from.lng, to.lng),
    tollRoad.bounds.minLng
  ));

  const routeArea = Math.max(routeLatSpan * routeLatSpan + routeLngSpan * routeLngSpan, 0.001);
  const overlapArea = overlapLat * overlapLat + overlapLng * overlapLng;

  const ratio = Math.min(0.9, Math.sqrt(overlapArea / routeArea));

  // Ограничиваем разумными пределами
  const maxKmOnToll = Math.min(tollLength, routeKm);
  const estimatedKm = routeKm * ratio;

  return Math.min(ratio, maxKmOnToll / routeKm);
}

module.exports = { calculateTolls, isRouteOnTollRoad };
