import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPES = [
  { id: 'лес', label: 'лес', icon: '🌲' },
  { id: 'вода', label: 'вода', icon: '💧' },
  { id: 'болота', label: 'болота', icon: '🌿' },
  { id: 'скалы', label: 'скалы', icon: '⛰️' },
  { id: 'панорамы', label: 'панорамы', icon: '🔭' },
  { id: 'исторические', label: 'история', icon: '🏰' },
];

const DURATIONS = [
  { id: 'полдня', label: 'Полдня', icon: '☀️' },
  { id: 'весь день', label: 'Весь день', icon: '🌅' },
];

const TRANSPORT_TYPES = [
  { id: 'автомобиль', label: 'Свой автомобиль', icon: '🚗' },
  { id: 'каршеринг', label: 'Каршеринг', icon: '🔑' },
  { id: 'общественный', label: 'Общественный', icon: '🚌' },
];

const TRANSPORT_MODES = [
  { id: 'туда-обратно', label: 'Туда-обратно', icon: '↔️' },
  { id: 'комбинированный', label: 'Комбинированный', icon: '🔀' },
];

const GROUPS = [
  { id: 'одному', label: 'Одному', icon: '🧍' },
  { id: 'вдвоём', label: 'Вдвоём', icon: '👫' },
  { id: 'семьёй', label: 'Семьёй', icon: '👨‍👩‍👧' },
  { id: 'компанией', label: 'Компанией', icon: '👥' },
];

const EXTRAS = [
  { id: 'с детьми', label: 'С детьми', icon: '👧' },
  { id: 'с собакой', label: 'С собакой', icon: '🐕' },
];

const DEFAULT_PARAMS = {
  date: new Date().toISOString().split('T')[0],
  budget: 5000,
  duration: 'весь день',
  transportType: 'каршеринг',
  transportMode: 'туда-обратно',
  types: [],
  group: 'одному',
  extras: [],
};

export default function Home() {
  const navigate = useNavigate();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const toggleType = (id) => {
    setParams(p => ({
      ...p,
      types: p.types.includes(id) ? p.types.filter(t => t !== id) : [...p.types, id],
    }));
  };

  const toggleExtra = (id) => {
    setParams(p => ({
      ...p,
      extras: p.extras.includes(id) ? p.extras.filter(e => e !== id) : [...p.extras, id],
    }));
  };

  const fetchRoutes = async () => {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Ошибка сервера');
    return res.json();
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoutes();
      navigate('/results', { state: { routes: data.routes, weather: data.weather, params } });
    } catch {
      setError('Не удалось загрузить маршруты. Проверьте, запущен ли сервер.');
    } finally {
      setLoading(false);
    }
  };

  const handleAI = async () => {
    setLoading(true);
    setError('');
    try {
      const [routesData, aiData] = await Promise.all([
        fetchRoutes(),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }).then(r => r.json()),
      ]);
      navigate('/results', {
        state: {
          routes: routesData.routes,
          weather: routesData.weather,
          params,
          aiMode: true,
          aiRecommendations: aiData.recommendations,
        },
      });
    } catch {
      setError('Не удалось получить AI-подборку.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-lg mx-auto px-4 pt-10 pb-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🗺️</div>
          <h1 className="text-3xl font-bold text-emerald-900">Маршруты из Петербурга</h1>
          <p className="text-gray-500 mt-2 text-sm">Однодневные поездки по Ленинградской области</p>
        </div>

        <div className="space-y-7">

          {/* Date */}
          <Section label="Дата поездки">
            <input
              type="date"
              min={today}
              value={params.date}
              onChange={e => setParams(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-gray-900 text-base"
            />
          </Section>

          {/* Budget */}
          <Section label={<>Бюджет: <span className="text-emerald-600 font-bold">{params.budget.toLocaleString('ru')} ₽</span></>}>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={params.budget}
              onChange={e => setParams(p => ({ ...p, budget: Number(e.target.value) }))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 000 ₽</span>
              <span>15 000 ₽</span>
            </div>
          </Section>

          {/* Duration */}
          <Section label="Длительность">
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map(d => (
                <ToggleButton
                  key={d.id}
                  active={params.duration === d.id}
                  onClick={() => setParams(p => ({ ...p, duration: d.id }))}
                >
                  {d.icon} {d.label}
                </ToggleButton>
              ))}
            </div>
          </Section>

          {/* Transport type */}
          <Section label="Транспорт">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {TRANSPORT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setParams(p => ({ ...p, transportType: t.id }))}
                  className={`py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                    params.transportType === t.id
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TRANSPORT_MODES.map(m => (
                <ToggleButton
                  key={m.id}
                  active={params.transportMode === m.id}
                  onClick={() => setParams(p => ({ ...p, transportMode: m.id }))}
                >
                  {m.icon} {m.label}
                </ToggleButton>
              ))}
            </div>
          </Section>

          {/* Types */}
          <Section label="Что хочется увидеть">
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                    params.types.includes(t.id)
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {params.types.length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">Не выбрано — покажем все типы</p>
            )}
          </Section>

          {/* Composition */}
          <Section label="С кем едете">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {GROUPS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setParams(p => ({ ...p, group: g.id }))}
                  className={`py-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                    params.group === g.id
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXTRAS.map(e => (
                <button
                  key={e.id}
                  onClick={() => toggleExtra(e.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${
                    params.extras.includes(e.id)
                      ? 'bg-amber-400 text-white shadow-sm shadow-amber-200'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  <span className="text-base">{e.icon}</span>
                  <span>{e.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? '⏳ Ищу маршруты...' : 'Найти маршруты'}
            </button>
            <button
              onClick={handleAI}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-200 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? '⏳ AI думает...' : '✨ Подобрать за меня'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2.5">{label}</label>
      {children}
    </div>
  );
}

function ToggleButton({ active, onClick, children, full }) {
  return (
    <button
      onClick={onClick}
      className={`${full ? 'w-full' : ''} py-3 px-4 rounded-xl text-sm font-medium text-left transition-all active:scale-[0.98] ${
        active
          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
      }`}
    >
      {children}
    </button>
  );
}
