import { useEffect } from 'react';
import { useYandexMap } from '../hooks/useYandexMap';
import './MapPanel.css';

const MAP_ID = 'tms-yandex-map';

export function MapPanel({ result, loading, pickingPoint, onMapClick }) {
  const { isReady, drawRoute, clearObjects, setCursor } = useYandexMap(MAP_ID, { onMapClick });

  // Курсор — crosshair когда выбираем точку
  useEffect(() => {
    if (!isReady) return;
    setCursor(pickingPoint ? 'crosshair' : '');
  }, [pickingPoint, isReady]);

  // Нарисовать маршрут когда пришёл результат
  useEffect(() => {
    if (!isReady) return;
    if (!result) { clearObjects(); return; }
    const wps = result.route.waypoints;
    if (wps && wps.length >= 2) drawRoute(wps);
  }, [result, isReady]);

  const pickingLabels = { loading: 'А', unloading: 'Б', return: 'В' };
  const pickingLabel = pickingPoint ? pickingLabels[pickingPoint] : null;

  return (
    <div className="map-panel">
      {/* Легенда */}
      <div className="map-legend">
        <div className="map-legend__item"><span className="map-legend__dot" style={{ background: '#22c55e' }} />А — Постановка</div>
        <div className="map-legend__item"><span className="map-legend__line" style={{ background: '#4f80ff' }} />Плечо 1</div>
        <div className="map-legend__item"><span className="map-legend__dot" style={{ background: '#4f80ff' }} />Б — Выгрузка</div>
        <div className="map-legend__item"><span className="map-legend__line" style={{ background: '#f59e0b' }} />Плечо 2</div>
        <div className="map-legend__item"><span className="map-legend__dot" style={{ background: '#f59e0b' }} />В — Сдача</div>
      </div>

      <div id={MAP_ID} className="map-panel__map" />

      {/* Режим выбора точки кликом */}
      {pickingPoint && (
        <div className="map-pick-overlay">
          <div className="map-pick-overlay__badge">
            <span className="map-pick-overlay__dot">{pickingLabel}</span>
            Кликните на карте, чтобы поставить точку
            <button className="map-pick-overlay__cancel" onClick={() => onMapClick(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="map-overlay">
          <div className="map-overlay__content">
            <div className="map-overlay__spinner" />
            <div className="map-overlay__text">Строю маршрут...</div>
          </div>
        </div>
      )}

      {/* Заглушка */}
      {!result && !loading && !pickingPoint && (
        <div className="map-placeholder">
          <div className="map-placeholder__icon">🗺️</div>
          <div className="map-placeholder__title">Карта маршрута</div>
          <div className="map-placeholder__sub">Введите адреса или кликайте на карте — нажмите 📍 рядом с полем</div>
        </div>
      )}

      {result?.isFallback && (
        <div className="map-fallback-badge">⚠️ Расстояние рассчитано приблизительно</div>
      )}
    </div>
  );
}
