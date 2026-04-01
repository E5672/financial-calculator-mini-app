/**
 * Экономика рейса
 * Расчет дохода, расходов и прибыли
 */

const DEFAULT_FUEL_CONSUMPTION = 35; // л/100км для фуры 20т с контейнером
const DEFAULT_FUEL_PRICE = 65;       // руб/литр (дизель)
const DEFAULT_RATE_PER_KM = 55;      // руб/км ставка перевозчику

/**
 * Рассчитать полную экономику рейса
 */
function calculateEconomics(params) {
  const {
    totalDistanceKm,
    ratePerKm = DEFAULT_RATE_PER_KM,
    fuelConsumptionPer100km = DEFAULT_FUEL_CONSUMPTION,
    fuelPricePerLiter = DEFAULT_FUEL_PRICE,
    tollCost = 0,
    platonCost = 0,
    driverDailyRate = 3000,   // суточные водителя
    otherExpenses = 0,        // прочие расходы
  } = params;

  // Доход
  const revenue = Math.round(totalDistanceKm * ratePerKm);

  // Расходы
  const fuelLiters = Math.round(totalDistanceKm * fuelConsumptionPer100km / 100 * 10) / 10;
  const fuelCost = Math.round(fuelLiters * fuelPricePerLiter);

  // Суточные водителя (примерный расчет: 600 км/день)
  const tripDays = Math.ceil(totalDistanceKm / 600);
  const driverCost = tripDays * driverDailyRate;

  const totalExpenses = fuelCost + tollCost + platonCost + driverCost + otherExpenses;
  const profit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? Math.round(profit / revenue * 1000) / 10 : 0;

  return {
    // Доход
    revenue,
    ratePerKm,

    // Расходы (детализация)
    expenses: {
      fuel: {
        liters: fuelLiters,
        pricePerLiter: fuelPricePerLiter,
        consumptionPer100km: fuelConsumptionPer100km,
        total: fuelCost,
      },
      tolls: {
        total: tollCost,
      },
      platon: {
        total: platonCost,
      },
      driver: {
        days: tripDays,
        dailyRate: driverDailyRate,
        total: driverCost,
      },
      other: otherExpenses,
      total: totalExpenses,
    },

    // Итог
    profit,
    profitMargin,
    profitStatus: profit > 0 ? 'profitable' : profit === 0 ? 'break_even' : 'loss',

    // Дополнительно
    tripDays,
    costPerKm: totalDistanceKm > 0 ? Math.round(totalExpenses / totalDistanceKm * 10) / 10 : 0,
  };
}

/**
 * Дефолтные параметры для UI
 */
function getDefaults() {
  return {
    fuelConsumptionPer100km: DEFAULT_FUEL_CONSUMPTION,
    fuelPricePerLiter: DEFAULT_FUEL_PRICE,
    ratePerKm: DEFAULT_RATE_PER_KM,
    driverDailyRate: 3000,
    otherExpenses: 0,
  };
}

module.exports = { calculateEconomics, getDefaults };
