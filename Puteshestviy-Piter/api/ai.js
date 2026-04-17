const allRoutes = require('../data/routes.json');

function scoreRoute(route, params) {
  const extras = params.extras || [];
  if (extras.includes('с детьми') && !route.kidFriendly) return -Infinity;
  if (extras.includes('с собакой') && !route.dogFriendly) return -Infinity;
  if (route.baseCost > params.budget) return -Infinity;
  if (params.group === 'семьёй' && !route.kidFriendly) return -Infinity;

  let score = 0;
  const types = params.types || [];

  if (types.length > 0) {
    const matching = types.filter(t => route.types.includes(t)).length;
    score += matching * 20;
    if (matching === 0) score -= 30;
  }

  if (params.duration === 'полдня' && route.durationHours <= 4) score += 15;
  if (params.duration === 'весь день' && route.durationHours >= 5) score += 15;

  const transportType = params.transportType || 'каршеринг';
  const transportMode = params.transportMode || 'туда-обратно';

  if (transportType === 'общественный' && route.hasRailStation) score += 30;
  if (transportMode === 'комбинированный' && route.hasRailStation) score += 25;
  if (transportType === 'общественный' && !route.hasRailStation) score -= 20;

  if (params.group === 'семьёй' && route.kidFriendly) score += 15;
  if (extras.includes('с детьми') && route.kidFriendly) score += 15;
  if (extras.includes('с собакой') && route.dogFriendly) score += 15;

  const budgetRatio = route.baseCost / params.budget;
  score += budgetRatio < 0.5 ? 10 : budgetRatio < 0.75 ? 7 : 3;

  return score;
}

function buildReason(route, params) {
  const parts = [];
  const types = params.types || [];
  const extras = params.extras || [];
  const matching = types.filter(t => route.types.includes(t));

  if (matching.length > 0) {
    const icons = { лес: '🌲', вода: '💧', болота: '🌿', скалы: '⛰️', панорамы: '🔭', исторические: '🏰' };
    parts.push(`Совпадает с вашими предпочтениями: ${matching.map(t => icons[t] + ' ' + t).join(', ')}`);
  }

  const transportType = params.transportType || 'каршеринг';
  const transportMode = params.transportMode || 'туда-обратно';

  if ((transportType === 'общественный' || transportMode === 'комбинированный') && route.hasRailStation) {
    parts.push(`удобно на электричке (ст. ${route.railStationName})`);
  }

  if (params.group === 'семьёй' && route.kidFriendly) parts.push('безопасно для всей семьи');
  if (extras.includes('с детьми') && route.kidFriendly) parts.push('подходит для детей');
  if (extras.includes('с собакой') && route.dogFriendly) parts.push('можно с собакой');

  if (params.group === 'вдвоём') parts.push('отличный вариант для двоих');
  if (params.group === 'компанией' && route.durationHours >= 6) parts.push('насыщенный маршрут для компании');

  const budgetRatio = route.baseCost / params.budget;
  if (budgetRatio < 0.5) {
    parts.push(`хорошо вписывается в бюджет (~${route.baseCost.toLocaleString('ru')} из ${params.budget.toLocaleString('ru')} ₽)`);
  }

  if (params.duration === 'полдня' && route.durationHours <= 4) parts.push('оптимальная длина для полудня');
  if (params.duration === 'весь день' && route.durationHours >= 6) parts.push('насыщенный маршрут на целый день');

  if (parts.length === 0) {
    parts.push(`один из лучших вариантов в ${route.distanceKm} км от СПб с уровнем сложности «${route.difficulty}»`);
  }

  return parts.join('; ') + '.';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const params = req.body;

  const scored = allRoutes
    .filter(r => r.distanceKm <= 200)
    .map(r => ({ route: r, score: scoreRoute(r, params) }))
    .filter(r => r.score > -Infinity)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const recommendations = scored.map(({ route }) => ({
    routeId: route.id,
    reason: buildReason(route, params),
  }));

  res.json({ recommendations });
};
