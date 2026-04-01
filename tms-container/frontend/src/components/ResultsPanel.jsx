import React, { useState } from 'react';
import './ResultsPanel.css';

function fmt(num) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(num));
}

function fmtKm(km) {
  return `${fmt(km)} км`;
}

function fmtRub(rub) {
  return `${fmt(rub)} ₽`;
}

function fmtMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} мин`;
  return `${h} ч ${m} мин`;
}

export function ResultsPanel({ result, error }) {
  const [activeTab, setActiveTab] = useState('distance');

  if (error) {
    return (
      <div className="results-panel">
        <div className="results-error">
          <div className="results-error__icon">⚠️</div>
          <div className="results-error__title">Ошибка расчёта</div>
          <div className="results-error__msg">{error}</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel results-panel--empty">
        <div className="results-empty">
          <div className="results-empty__icon">📊</div>
          <div className="results-empty__title">Результаты рейса</div>
          <div className="results-empty__sub">Здесь появится расчёт после нажатия кнопки «Рассчитать рейс»</div>
        </div>
      </div>
    );
  }

  const { route, tolls, platon, economics } = result;

  const tabs = [
    { id: 'distance', label: 'Маршрут', icon: '🗺️' },
    { id: 'tolls', label: 'Платные', icon: '🛣️' },
    { id: 'platon', label: 'Платон', icon: '🏛️' },
    { id: 'economics', label: 'Экономика', icon: '💰' },
  ];

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <div className="results-panel__title">Результаты расчёта</div>
        <div className="results-panel__meta">
          {result.isFallback && (
            <span className="badge badge--warning">Прибл.</span>
          )}
          <span className="badge badge--success">Готово</span>
        </div>
      </div>

      {/* KPI шапка */}
      <div className="kpi-bar">
        <KpiCard
          label="Расстояние"
          value={fmtKm(route.totalDistanceKm)}
          icon="📏"
          color="primary"
        />
        <KpiCard
          label="Время в пути"
          value={fmtMin(route.totalDurationMin)}
          icon="⏱️"
          color="accent"
        />
        <KpiCard
          label="Прибыль"
          value={fmtRub(economics.profit)}
          icon={economics.profitStatus === 'profitable' ? '📈' : '📉'}
          color={economics.profitStatus === 'profitable' ? 'success' : 'danger'}
        />
      </div>

      {/* Табы */}
      <div className="results-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`results-tab ${activeTab === tab.id ? 'results-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="results-content">
        {activeTab === 'distance' && <DistanceTab route={route} />}
        {activeTab === 'tolls' && <TollsTab tolls={tolls} />}
        {activeTab === 'platon' && <PlatonTab platon={platon} />}
        {activeTab === 'economics' && <EconomicsTab economics={economics} />}
      </div>
    </div>
  );
}

/* ── KPI карточка ── */
function KpiCard({ label, value, icon, color }) {
  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card__icon">{icon}</div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
    </div>
  );
}

/* ── Таб маршрут ── */
function DistanceTab({ route }) {
  const segColors = ['#4f80ff', '#f59e0b'];
  const segLabels = ['А → Б', 'Б → В'];

  return (
    <div className="tab-content fade-in">
      <SectionTitle icon="📏" title="Расстояние по плечам" />
      <div className="segment-list">
        {route.segments.map((seg, idx) => (
          <div key={idx} className="segment-row">
            <div className="segment-row__label">
              <span className="segment-dot" style={{ background: segColors[idx] }} />
              <div>
                <div className="segment-row__leg">{segLabels[idx]}</div>
                <div className="segment-row__points">{seg.from} → {seg.to}</div>
              </div>
            </div>
            <div className="segment-row__stats">
              <div className="segment-row__km">{fmtKm(seg.distanceKm)}</div>
              <div className="segment-row__time">{fmtMin(seg.durationMin)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="total-row">
        <span>Итого по маршруту</span>
        <span className="total-row__value">{fmtKm(route.totalDistanceKm)}</span>
      </div>
      <div className="total-row total-row--sub">
        <span>Время в пути</span>
        <span>{fmtMin(route.totalDurationMin)}</span>
      </div>

      <SectionTitle icon="📍" title="Точки маршрута" />
      <div className="waypoints-list">
        {route.waypoints.map((wp, idx) => {
          const icons = ['🟢', '🔵', '🟡'];
          const labels = ['Постановка', 'Выгрузка', 'Сдача'];
          return (
            <div key={idx} className="waypoint-row">
              <span>{icons[idx]}</span>
              <div>
                <div className="waypoint-row__label">{labels[idx]}</div>
                <div className="waypoint-row__addr">{wp.name || wp.address}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Таб платные дороги ── */
function TollsTab({ tolls }) {
  if (tolls.avoidTolls) {
    return (
      <div className="tab-content fade-in">
        <div className="info-banner info-banner--success">
          ✅ Маршрут проложен без платных дорог
        </div>
      </div>
    );
  }

  if (tolls.roads.length === 0) {
    return (
      <div className="tab-content fade-in">
        <div className="info-banner">
          ℹ️ Маршрут не проходит через известные платные дороги
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content fade-in">
      <SectionTitle icon="🛣️" title="Платные участки" />
      <div className="toll-list">
        {tolls.roads.map((road, idx) => (
          <div key={idx} className="toll-card">
            <div className="toll-card__header">
              <div>
                <div className="toll-card__name">{road.name}</div>
                <div className="toll-card__desc">{road.description}</div>
              </div>
              <div className="toll-card__cost">{fmtRub(road.cost)}</div>
            </div>
            <div className="toll-card__details">
              <span>~{road.estimatedKm} км × {road.ratePerKm} ₽/км</span>
              <span className="badge badge--neutral">{road.highway}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="total-row">
        <span>Итого платные дороги</span>
        <span className="total-row__value">{fmtRub(tolls.totalCost)}</span>
      </div>
    </div>
  );
}

/* ── Таб Платон ── */
function PlatonTab({ platon }) {
  return (
    <div className="tab-content fade-in">
      <SectionTitle icon="🏛️" title="Система «Платон»" />
      <div className="info-banner info-banner--neutral">
        Плата для грузовиков массой свыше 12 тонн по федеральным трассам
      </div>

      <div className="detail-table">
        <DetailRow label="Общее расстояние" value={fmtKm(platon.totalDistanceKm)} />
        <DetailRow label="Доля федеральных трасс" value={`${Math.round(platon.federalRatio * 100)}%`} />
        <DetailRow label="Километраж по федеральным трассам" value={fmtKm(platon.federalKm)} accent />
        <DetailRow label="Тариф" value={`${platon.rate} ₽/км`} />
      </div>

      <div className="total-row total-row--featured">
        <span>Стоимость Платона</span>
        <span className="total-row__value">{fmtRub(platon.cost)}</span>
      </div>

      <div className="platon-note">
        <span>📋</span>
        {platon.rateInfo?.description} • Тариф: {platon.rateInfo?.current} {platon.rateInfo?.unit}
      </div>
    </div>
  );
}

/* ── Таб экономика ── */
function EconomicsTab({ economics }) {
  const isProfitable = economics.profitStatus === 'profitable';
  const isLoss = economics.profitStatus === 'loss';

  return (
    <div className="tab-content fade-in">
      <SectionTitle icon="💰" title="Доходная часть" />
      <div className="detail-table">
        <DetailRow label="Ставка" value={`${economics.ratePerKm} ₽/км`} />
        <DetailRow label="Доход (выручка)" value={fmtRub(economics.revenue)} accent />
      </div>

      <SectionTitle icon="📉" title="Расходная часть" />
      <div className="expense-list">
        <ExpenseRow
          icon="⛽"
          label="Топливо"
          sub={`${economics.expenses.fuel.liters} л × ${economics.expenses.fuel.pricePerLiter} ₽/л (${economics.expenses.fuel.consumptionPer100km} л/100км)`}
          value={fmtRub(economics.expenses.fuel.total)}
        />
        <ExpenseRow
          icon="🛣️"
          label="Платные дороги"
          value={fmtRub(economics.expenses.tolls.total)}
        />
        <ExpenseRow
          icon="🏛️"
          label="Платон"
          value={fmtRub(economics.expenses.platon.total)}
        />
        <ExpenseRow
          icon="👤"
          label="Суточные водителя"
          sub={`${economics.tripDays} сут × ${economics.expenses.driver.dailyRate} ₽`}
          value={fmtRub(economics.expenses.driver.total)}
        />
        {economics.expenses.other > 0 && (
          <ExpenseRow
            icon="📦"
            label="Прочие расходы"
            value={fmtRub(economics.expenses.other)}
          />
        )}
        <div className="expense-row expense-row--total">
          <div className="expense-row__label">Итого расходы</div>
          <div className="expense-row__value">{fmtRub(economics.expenses.total)}</div>
        </div>
      </div>

      {/* Прибыль */}
      <div className={`profit-block profit-block--${economics.profitStatus}`}>
        <div className="profit-block__header">
          <span className="profit-block__icon">
            {isProfitable ? '📈' : isLoss ? '📉' : '➡️'}
          </span>
          <span className="profit-block__label">
            {isProfitable ? 'Прибыль' : isLoss ? 'Убыток' : 'Безубыточность'}
          </span>
        </div>
        <div className="profit-block__value">
          {isProfitable ? '+' : ''}{fmtRub(economics.profit)}
        </div>
        <div className="profit-block__margin">
          Маржинальность: {economics.profitMargin}%
          {' · '}
          Себестоимость: {economics.costPerKm} ₽/км
        </div>
      </div>
    </div>
  );
}

/* ── Вспомогательные ── */
function SectionTitle({ icon, title }) {
  return (
    <div className="section-title">
      <span>{icon}</span>
      {title}
    </div>
  );
}

function DetailRow({ label, value, accent }) {
  return (
    <div className={`detail-row ${accent ? 'detail-row--accent' : ''}`}>
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value}</span>
    </div>
  );
}

function ExpenseRow({ icon, label, sub, value }) {
  return (
    <div className="expense-row">
      <div className="expense-row__left">
        <span className="expense-row__icon">{icon}</span>
        <div>
          <div className="expense-row__label">{label}</div>
          {sub && <div className="expense-row__sub">{sub}</div>}
        </div>
      </div>
      <div className="expense-row__value">{value}</div>
    </div>
  );
}
