import { useState, useCallback } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { MapPanel } from './components/MapPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { calculateRoute } from './services/api';
import { reverseGeocode } from './services/ymapsGeocode';
import './styles/App.css';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Какую точку сейчас выбираем с карты: null | 'loading' | 'unloading' | 'return'
  const [pickingPoint, setPickingPoint] = useState(null);
  // Колбэк для LeftPanel чтобы обновить конкретную точку
  const [setPointFromMapRef, setSetPointFromMapRef] = useState(null);

  async function handleCalculate(params) {
    setLoading(true);
    setError(null);
    try {
      const data = await calculateRoute(params);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details || err.message;
      setError(msg || 'Неизвестная ошибка');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Пользователь кликнул на карту в режиме выбора точки
  const handleMapClick = useCallback(async (coords) => {
    // coords === null → отмена режима
    if (!coords || !pickingPoint) {
      setPickingPoint(null);
      return;
    }

    // Получить адрес по координатам
    const address = await reverseGeocode(coords.lat, coords.lng);

    if (setPointFromMapRef) {
      setPointFromMapRef(pickingPoint, { address, lat: coords.lat, lng: coords.lng });
    }
    setPickingPoint(null);
  }, [pickingPoint, setPointFromMapRef]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__left">
          <span className="topbar__logo">⬡ TMS</span>
          <span className="topbar__divider" />
          <span className="topbar__title">Расчёт контейнерных перевозок</span>
        </div>
        <div className="topbar__right">
          <div className="topbar__status">
            <span className="status-dot status-dot--live" />
            Онлайн
          </div>
          <div className="topbar__version">v1.0.0</div>
        </div>
      </header>

      <main className="workspace">
        <LeftPanel
          onCalculate={handleCalculate}
          loading={loading}
          pickingPoint={pickingPoint}
          onStartPicking={(pointKey, setter) => {
            setPickingPoint(pointKey);
            setSetPointFromMapRef(() => setter);
          }}
          onCancelPicking={() => setPickingPoint(null)}
        />
        <MapPanel
          result={result}
          loading={loading}
          pickingPoint={pickingPoint}
          onMapClick={handleMapClick}
        />
        <ResultsPanel result={result} error={error} />
      </main>
    </div>
  );
}
