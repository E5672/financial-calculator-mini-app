const allRoutes = require('../data/routes.json');

function parseWeatherCode(code) {
  if (code === 0) return { description: 'ясное небо', icon: '☀️', rain: false, snow: false };
  if (code <= 3) return { description: 'переменная облачность', icon: '⛅', rain: false, snow: false };
  if (code <= 48) return { description: 'туман', icon: '🌫️', rain: false, snow: false };
  if (code <= 67) return { description: 'дождь', icon: '🌧️', rain: true, snow: false };
  if (code <= 77) return { description: 'снег', icon: '❄️', rain: false, snow: true };
  if (code <= 82) return { description: 'ливень', icon: '🌦️', rain: true, snow: false };
  if (code <= 86) return { description: 'снегопад', icon: '🌨️', rain: false, snow: true };
  return { description: 'гроза', icon: '⛈️', rain: true, snow: false };
}

async function fetchWeather(date) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=60.0&longitude=30.5&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_sum&timezone=Europe%2FMoscow&start_date=${date}&end_date=${date}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.daily) return null;

    const code = data.daily.weathercode?.[0] ?? 0;
    const parsed = parseWeatherCode(code);
    const tempMax = data.daily.temperature_2m_max?.[0] ?? 15;
    const tempMin = data.daily.temperature_2m_min?.[0] ?? 10;
    const windSpeed = Math.round(data.daily.windspeed_10m_max?.[0] ?? 5);

    return {
      ...parsed,
      temp: Math.round((tempMax + tempMin) / 2),
      windSpeed,
    };
  } catch {
    return null;
  }
}

function scoreRoute(route, params, weather) {
  const extras = params.extras || [];
  if (extras.includes('с детьми') && !route.kidFriendly) return -1;
  if (extras.includes('с собакой') && !route.dogFriendly) return -1;
  if (route.baseCost > params.budget) return -1;
  if (weather?.windSpeed > 12 && route.difficulty === 'сложно') return -1;

  // семьёй implies children-friendly preference
  if (params.group === 'семьёй' && !route.kidFriendly) return -1;

  let score = 50;

  const types = params.types || [];
  if (types.length > 0) {
    const matching = types.filter(t => route.types.includes(t)).length;
    score += matching * 15;
    if (matching === 0) score -= 20;
  }

  if (params.duration === 'полдня' && route.durationHours <= 4) score += 10;
  if (params.duration === 'весь день' && route.durationHours >= 5) score += 10;

  // Transport scoring
  const transportType = params.transportType || 'каршеринг';
  const transportMode = params.transportMode || 'туда-обратно';

  if (transportType === 'общественный') {
    score += route.hasRailStation ? 25 : -15;
  }
  if (transportMode === 'комбинированный') {
    score += route.hasRailStation ? 20 : -10;
  }

  // Group size boosts
  if (params.group === 'компанией' && route.durationHours >= 6) score += 5;
  if (params.group === 'семьёй' && route.kidFriendly) score += 10;
  if (extras.includes('с детьми') && route.kidFriendly) score += 10;
  if (extras.includes('с собакой') && route.dogFriendly) score += 10;

  const ratio = route.baseCost / params.budget;
  score += ratio < 0.4 ? 5 : ratio < 0.7 ? 10 : 3;

  if (weather) {
    if (weather.rain) score -= 20;
    if (weather.snow) score -= 10;
    if (weather.windSpeed > 15) score -= 15;
    if (weather.temp >= 12 && weather.temp <= 24) score += 8;
    if (weather.temp < 0) score -= 5;
    if ((weather.rain || weather.snow) && route.types.includes('исторические')) score += 10;
  }

  return score;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const params = req.body;
  const weather = await fetchWeather(params.date);

  const scored = allRoutes
    .filter(r => r.distanceKm <= 200)
    .map(r => ({ ...r, score: scoreRoute(r, params, weather) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  res.json({ routes: scored, weather });
};
