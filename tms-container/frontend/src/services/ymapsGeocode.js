/**
 * Геокодирование через Яндекс.Карты JS API (клиентская сторона)
 * Использует ymaps.geocode() — работает с любым ключом JS API
 */

let ymapsReadyPromise = null;

export function waitForYmaps() {
  if (ymapsReadyPromise) return ymapsReadyPromise;
  ymapsReadyPromise = new Promise((resolve) => {
    const check = () => {
      if (window.ymaps && window.ymaps.geocode) {
        window.ymaps.ready(() => resolve(window.ymaps));
      } else {
        setTimeout(check, 150);
      }
    };
    check();
  });
  return ymapsReadyPromise;
}

/**
 * Подсказки адресов — через ymaps.geocode (надёжнее suggest)
 */
export async function fetchSuggestionsClient(query) {
  if (!query || query.length < 2) return [];
  try {
    const ymaps = await waitForYmaps();

    // Пробуем suggest API
    if (ymaps.suggest) {
      try {
        const items = await ymaps.suggest(query, { results: 7, lang: 'ru_RU' });
        if (items && items.length > 0) {
          return items.map(r => ({
            value: r.displayName,
            name: r.displayName.split(',')[0].trim(),
            description: r.displayName.split(',').slice(1).join(',').trim(),
            _suggestValue: r.value,
            _fromSuggest: true,
          }));
        }
      } catch (_) { /* fallback ниже */ }
    }

    // Fallback: geocode как источник подсказок
    const res = await ymaps.geocode(query, { results: 7 });
    const suggestions = [];
    res.geoObjects.each(obj => {
      const fullAddr = obj.getAddressLine();
      const parts = fullAddr.split(',');
      const [lat, lng] = obj.geometry.getCoordinates();
      suggestions.push({
        value: fullAddr,
        name: parts[0].trim(),
        description: parts.slice(1).join(',').trim(),
        lat,
        lng,
        _fromGeocode: true,
      });
    });
    return suggestions;
  } catch (e) {
    console.warn('fetchSuggestionsClient error:', e);
    return [];
  }
}

/**
 * Получить координаты по адресу
 */
export async function geocodeClient(address, suggestValue) {
  const ymaps = await waitForYmaps();
  const query = suggestValue || address;
  const res = await ymaps.geocode(query, { results: 1 });
  const obj = res.geoObjects.get(0);
  if (!obj) throw new Error(`Адрес не найден: ${address}`);
  const [lat, lng] = obj.geometry.getCoordinates();
  return { lat, lng };
}

/**
 * Обратное геокодирование: координаты → адрес
 */
export async function reverseGeocode(lat, lng) {
  try {
    const ymaps = await waitForYmaps();
    const res = await ymaps.geocode([lat, lng], { results: 1 });
    const obj = res.geoObjects.get(0);
    if (!obj) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    return obj.getAddressLine();
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
