/**
 * Справочник платных дорог России
 * Данные актуальны на 2024 год
 */

const TOLL_ROADS = [
  {
    id: 'M11_1',
    name: 'М-11 «Нева» (Москва — СПб)',
    highway: 'M11',
    description: 'Москва — Санкт-Петербург',
    segments: [
      { from: 'Москва (МКАД)', to: 'Клин', km: 90, pricePerKm: 4.5 },
      { from: 'Клин', to: 'Тверь', km: 100, pricePerKm: 4.0 },
      { from: 'Тверь', to: 'Торжок', km: 60, pricePerKm: 3.5 },
      { from: 'Торжок', to: 'Новгород', km: 160, pricePerKm: 3.5 },
      { from: 'Новгород', to: 'Санкт-Петербург', km: 200, pricePerKm: 4.0 },
    ],
    // Координатные bounds для определения попадания
    bounds: {
      minLat: 55.75, maxLat: 60.0,
      minLng: 30.0, maxLng: 37.5
    },
    // Ключевые точки маршрута (упрощенно)
    waypoints: [
      { lat: 55.75, lng: 37.58 },  // Москва МКАД север
      { lat: 56.33, lng: 37.11 },  // Солнечногорск
      { lat: 56.84, lng: 36.73 },  // Клин
      { lat: 56.86, lng: 35.91 },  // Тверь
      { lat: 57.04, lng: 34.99 },  // Торжок
      { lat: 58.52, lng: 31.27 },  // Великий Новгород
      { lat: 59.95, lng: 30.32 },  // Санкт-Петербург
    ],
    truckRatePerKm: 4.5,
    minKm: 10,
  },
  {
    id: 'M4',
    name: 'М-4 «Дон» (Москва — Ростов)',
    highway: 'M4',
    description: 'Москва — Воронеж — Ростов-на-Дону',
    segments: [
      { from: 'Москва (МКАД)', to: 'Ступино', km: 80, pricePerKm: 3.5 },
      { from: 'Ступино', to: 'Тула', km: 80, pricePerKm: 3.0 },
      { from: 'Тула', to: 'Воронеж', km: 310, pricePerKm: 3.0 },
      { from: 'Воронеж', to: 'Ростов-на-Дону', km: 530, pricePerKm: 3.5 },
    ],
    bounds: {
      minLat: 47.2, maxLat: 55.8,
      minLng: 37.5, maxLng: 42.0
    },
    waypoints: [
      { lat: 55.60, lng: 37.63 },  // Москва МКАД юг
      { lat: 55.07, lng: 38.05 },  // Ступино
      { lat: 54.19, lng: 37.62 },  // Тула
      { lat: 51.67, lng: 39.18 },  // Воронеж
      { lat: 47.23, lng: 39.72 },  // Ростов-на-Дону
    ],
    truckRatePerKm: 3.5,
    minKm: 10,
  },
  {
    id: 'CKAD',
    name: 'ЦКАД (Центральная кольцевая)',
    highway: 'CKAD',
    description: 'Центральная кольцевая автодорога',
    segments: [
      { from: 'ЦКАД Север', to: 'ЦКАД Восток', km: 60, pricePerKm: 5.0 },
      { from: 'ЦКАД Восток', to: 'ЦКАД Юг', km: 60, pricePerKm: 5.0 },
      { from: 'ЦКАД Юг', to: 'ЦКАД Запад', km: 60, pricePerKm: 5.0 },
      { from: 'ЦКАД Запад', to: 'ЦКАД Север', km: 60, pricePerKm: 5.0 },
    ],
    bounds: {
      minLat: 55.40, maxLat: 56.20,
      minLng: 36.00, maxLng: 38.80
    },
    waypoints: [
      { lat: 56.02, lng: 37.20 },
      { lat: 55.95, lng: 38.25 },
      { lat: 55.45, lng: 38.10 },
      { lat: 55.50, lng: 36.50 },
    ],
    truckRatePerKm: 5.0,
    minKm: 5,
  },
  {
    id: 'M3',
    name: 'М-3 «Украина» (Москва — Брянск)',
    highway: 'M3',
    description: 'Москва — Калуга — Брянск',
    segments: [
      { from: 'Москва (МКАД)', to: 'Калуга', km: 180, pricePerKm: 2.5 },
      { from: 'Калуга', to: 'Брянск', km: 200, pricePerKm: 2.0 },
    ],
    bounds: {
      minLat: 52.9, maxLat: 55.7,
      minLng: 33.0, maxLng: 37.5
    },
    waypoints: [
      { lat: 55.57, lng: 37.37 },
      { lat: 54.51, lng: 36.26 },
      { lat: 53.24, lng: 34.36 },
    ],
    truckRatePerKm: 2.5,
    minKm: 10,
  },
  {
    id: 'M12',
    name: 'М-12 «Восток» (Москва — Казань)',
    highway: 'M12',
    description: 'Москва — Владимир — Нижний Новгород — Казань',
    segments: [
      { from: 'Москва (МКАД)', to: 'Владимир', km: 180, pricePerKm: 4.0 },
      { from: 'Владимир', to: 'Нижний Новгород', km: 240, pricePerKm: 4.0 },
      { from: 'Нижний Новгород', to: 'Казань', km: 400, pricePerKm: 3.5 },
    ],
    bounds: {
      minLat: 55.7, maxLat: 56.3,
      minLng: 37.8, maxLng: 49.2
    },
    waypoints: [
      { lat: 55.78, lng: 37.90 },
      { lat: 56.13, lng: 40.41 },
      { lat: 56.33, lng: 43.99 },
      { lat: 55.79, lng: 49.11 },
    ],
    truckRatePerKm: 4.0,
    minKm: 10,
  }
];

// Ставки Платон по годам (руб/км)
const PLATON_RATES = {
  current: 2.84,  // актуальная ставка 2024
  history: {
    '2015': 1.53,
    '2016': 1.53,
    '2017': 1.91,
    '2018': 2.04,
    '2019': 2.20,
    '2020': 2.34,
    '2021': 2.54,
    '2022': 2.54,
    '2023': 2.84,
    '2024': 2.84,
  }
};

// Минимальный процент федеральных трасс от общего маршрута
// (эвристика для расчета Платона без точного трекинга)
const FEDERAL_HIGHWAY_RATIO = {
  // Если маршрут длиннее X км, то Y% пути — федеральные трассы
  ranges: [
    { minKm: 0, maxKm: 100, ratio: 0.3 },
    { minKm: 100, maxKm: 300, ratio: 0.5 },
    { minKm: 300, maxKm: 600, ratio: 0.65 },
    { minKm: 600, maxKm: 1000, ratio: 0.75 },
    { minKm: 1000, maxKm: Infinity, ratio: 0.80 },
  ]
};

module.exports = { TOLL_ROADS, PLATON_RATES, FEDERAL_HIGHWAY_RATIO };
