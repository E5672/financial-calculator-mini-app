import axios from 'axios';

const BASE_URL = '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * Рассчитать рейс (координаты уже известны с клиента)
 */
export async function calculateRoute(params) {
  const res = await api.post('/route/calculate', params);
  return res.data;
}

/**
 * Получить дефолтные параметры
 */
export async function getDefaults() {
  const res = await api.get('/route/defaults');
  return res.data;
}
