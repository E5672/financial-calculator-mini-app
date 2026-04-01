import { useState, useCallback } from 'react';
import { AddressInput } from './AddressInput';
import './LeftPanel.css';

export function LeftPanel({ onCalculate, loading, pickingPoint, onStartPicking, onCancelPicking }) {
  const [points, setPoints] = useState({ loading: null, unloading: null, return: null });

  const [routeOptions, setRouteOptions] = useState({
    avoidTolls: false,
    truckRestrictions: true,
    preferHighways: true,
  });

  const [economics, setEconomics] = useState({
    ratePerKm: 55,
    fuelConsumptionPer100km: 35,
    fuelPricePerLiter: 65,
    platonRate: 2.84,
    driverDailyRate: 3000,
    otherExpenses: 0,
  });

  const canCalculate = points.loading?.lat && points.unloading?.lat && points.return?.lat;

  // Этот setter передаётся в App, чтобы он мог проставить точку с карты
  const setPointFromMap = useCallback((pointKey, value) => {
    setPoints(prev => ({ ...prev, [pointKey]: value }));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!canCalculate) return;
    onCalculate({
      pointLoading: { lat: points.loading.lat, lng: points.loading.lng, address: points.loading.address },
      pointUnloading: { lat: points.unloading.lat, lng: points.unloading.lng, address: points.unloading.address },
      pointReturn: { lat: points.return.lat, lng: points.return.lng, address: points.return.address },
      ...routeOptions,
      ...economics,
    });
  }

  function handlePickFromMap(pointKey) {
    if (pickingPoint === pointKey) {
      onCancelPicking();
    } else {
      onStartPicking(pointKey, setPointFromMap);
    }
  }

  function handleToggle(key) {
    setRouteOptions(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleEconChange(key, val) {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setEconomics(prev => ({ ...prev, [key]: num }));
    }
  }

  return (
    <form className="left-panel" onSubmit={handleSubmit}>
      <div className="left-panel__header">
        <div className="left-panel__logo">
          <span className="left-panel__logo-icon">🚛</span>
          <div>
            <div className="left-panel__logo-title">TMS Container</div>
            <div className="left-panel__logo-sub">Расчет контейнерных перевозок</div>
          </div>
        </div>
      </div>

      {/* ── Маршрут ── */}
      <section className="left-panel__section">
        <div className="left-panel__section-title">
          <span className="section-icon">📍</span>
          Маршрут
        </div>

        <div className="route-points">
          <div className="route-point">
            <div className="route-point__dot route-point__dot--a">А</div>
            <div className="route-point__input">
              <AddressInput
                label="Постановка контейнера"
                placeholder="Откуда забираем контейнер"
                value={points.loading}
                onChange={(val) => setPoints(p => ({ ...p, loading: val }))}
                onPickFromMap={() => handlePickFromMap('loading')}
                isPickingFromMap={pickingPoint === 'loading'}
                required
              />
            </div>
          </div>

          <div className="route-connector" />

          <div className="route-point">
            <div className="route-point__dot route-point__dot--b">Б</div>
            <div className="route-point__input">
              <AddressInput
                label="Пункт выгрузки"
                placeholder="Куда везём груз"
                value={points.unloading}
                onChange={(val) => setPoints(p => ({ ...p, unloading: val }))}
                onPickFromMap={() => handlePickFromMap('unloading')}
                isPickingFromMap={pickingPoint === 'unloading'}
                required
              />
            </div>
          </div>

          <div className="route-connector" />

          <div className="route-point">
            <div className="route-point__dot route-point__dot--c">В</div>
            <div className="route-point__input">
              <AddressInput
                label="Сдача контейнера"
                placeholder="Куда возвращаем контейнер"
                value={points.return}
                onChange={(val) => setPoints(p => ({ ...p, return: val }))}
                onPickFromMap={() => handlePickFromMap('return')}
                isPickingFromMap={pickingPoint === 'return'}
                required
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Транспорт ── */}
      <section className="left-panel__section">
        <div className="left-panel__section-title">
          <span className="section-icon">🚚</span>
          Параметры транспорта
        </div>
        <div className="transport-badge">
          <span>🚛</span>
          <div>
            <div className="transport-badge__name">Фура 20 тонн</div>
            <div className="transport-badge__sub">Тягач + полуприцеп</div>
          </div>
          <div className="transport-badge__check">✓</div>
        </div>
      </section>

      {/* ── Настройки ── */}
      <section className="left-panel__section">
        <div className="left-panel__section-title">
          <span className="section-icon">⚙️</span>
          Настройки маршрута
        </div>
        <div className="checkboxes">
          <CheckRow label="Избегать платных дорог" checked={routeOptions.avoidTolls} onChange={() => handleToggle('avoidTolls')} note="Маршрут по бесплатным дорогам" />
          <CheckRow label="Ограничения для грузовиков" checked={routeOptions.truckRestrictions} onChange={() => handleToggle('truckRestrictions')} note="Учитывать запрещающие знаки" />
          <CheckRow label="Приоритет магистралей" checked={routeOptions.preferHighways} onChange={() => handleToggle('preferHighways')} note="Федеральные трассы при возможности" />
        </div>
      </section>

      {/* ── Экономика ── */}
      <section className="left-panel__section">
        <div className="left-panel__section-title">
          <span className="section-icon">💰</span>
          Параметры расчёта
        </div>
        <div className="econ-grid">
          <NumField label="Ставка, руб/км" value={economics.ratePerKm} onChange={v => handleEconChange('ratePerKm', v)} min={1} />
          <NumField label="Расход, л/100 км" value={economics.fuelConsumptionPer100km} onChange={v => handleEconChange('fuelConsumptionPer100km', v)} min={1} />
          <NumField label="Цена дизеля, руб/л" value={economics.fuelPricePerLiter} onChange={v => handleEconChange('fuelPricePerLiter', v)} min={1} />
          <NumField label="Тариф Платон, руб/км" value={economics.platonRate} onChange={v => handleEconChange('platonRate', v)} min={0} step={0.01} />
          <NumField label="Суточные водителя" value={economics.driverDailyRate} onChange={v => handleEconChange('driverDailyRate', v)} min={0} />
          <NumField label="Прочие расходы, руб" value={economics.otherExpenses} onChange={v => handleEconChange('otherExpenses', v)} min={0} />
        </div>
      </section>

      <button
        type="submit"
        className={`btn-calculate ${loading ? 'btn-calculate--loading' : ''} ${!canCalculate ? 'btn-calculate--disabled' : ''}`}
        disabled={!canCalculate || loading}
      >
        {loading ? (<><span className="btn-spinner" />Расчёт маршрута...</>) : (<><span>🗺️</span>Рассчитать рейс</>)}
      </button>

      {!canCalculate && (
        <div className="hint-text">
          Введите адрес или нажмите 📍 чтобы выбрать точку на карте
        </div>
      )}
    </form>
  );
}

function CheckRow({ label, checked, onChange, note }) {
  return (
    <label className="check-row">
      <input type="checkbox" checked={checked} onChange={onChange} className="check-row__input" />
      <div className={`check-row__box ${checked ? 'check-row__box--checked' : ''}`}>{checked && <span>✓</span>}</div>
      <div className="check-row__text">
        <span className="check-row__label">{label}</span>
        {note && <span className="check-row__note">{note}</span>}
      </div>
    </label>
  );
}

function NumField({ label, value, onChange, min = 0, step = 1 }) {
  return (
    <div className="num-field">
      <label className="num-field__label">{label}</label>
      <input type="number" className="num-field__input" value={value} min={min} step={step} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
