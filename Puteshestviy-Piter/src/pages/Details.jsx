import { useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import PhotoGallery from '../components/PhotoGallery';
import Reviews from '../components/Reviews';

const MapView = lazy(() => import('../components/MapView'));

const DIFFICULTY = {
  легко: 'text-emerald-700 bg-emerald-50',
  средне: 'text-amber-700 bg-amber-50',
  сложно: 'text-red-700 bg-red-50',
};

const TYPE_ICON = {
  лес: '🌲', вода: '💧', болота: '🌿', скалы: '⛰️', панорамы: '🔭', исторические: '🏰',
};

const TICKET_ICON = {
  museum: '🏛️',
  park: '🌳',
  excursion: '🎫',
};

const TABS = [
  { id: 'обзор', label: 'Обзор' },
  { id: 'места', label: 'Места' },
  { id: 'билеты', label: 'Билеты' },
  { id: 'еда', label: 'Еда' },
  { id: 'карта', label: 'Карта' },
  { id: 'возврат', label: 'Возврат' },
  { id: 'отзывы', label: 'Отзывы' },
  { id: 'полезное', label: 'Полезное' },
];

export default function Details() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('обзор');

  if (!state?.route) {
    navigate('/');
    return null;
  }

  const { route, weather } = state;
  const diffColor = DIFFICULTY[route.difficulty] || 'text-gray-600 bg-gray-50';
  const transportInfo = route.transportInfo || {};
  const tickets = route.tickets || [];
  const cafes = route.cafes || [];
  const photos = route.photos || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Map — tall */}
      <div className="h-72 relative bg-gray-200">
        <Suspense fallback={<div className="h-full w-full bg-gray-200 animate-pulse" />}>
          <MapView
            lat={route.lat}
            lng={route.lng}
            name={route.name}
            hasParking={route.hasParking}
            hasRailStation={route.hasRailStation}
            railStationName={route.railStationName}
          />
        </Suspense>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-[1000] w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md text-gray-700 text-lg font-bold"
        >
          ←
        </button>
      </div>

      {/* Title block */}
      <div className="bg-white px-4 py-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug">{route.name}</h1>
        <div className="flex gap-3 mt-2 text-sm text-gray-500 flex-wrap items-center">
          <span>🗺 {route.distanceKm} км от СПб</span>
          <span>🚗 {route.driveTimeMin} мин езды</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffColor}`}>{route.difficulty}</span>
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {route.types.map(t => (
            <span key={t} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
              {TYPE_ICON[t]} {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-none gap-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ОБЗОР */}
        {tab === 'обзор' && (
          <>
            {/* Gallery */}
            {photos.length > 0 && (
              <div>
                <SectionTitle>Галерея маршрута</SectionTitle>
                <PhotoGallery routeId={route.id} photos={photos} />
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{route.description}</p>

            {/* Weather */}
            {weather && (
              <div className="bg-sky-50 rounded-2xl p-4 flex items-center gap-3 border border-sky-100">
                <span className="text-4xl">{weather.icon}</span>
                <div>
                  <p className="font-semibold text-sky-900 capitalize">{weather.description}, {weather.temp}°C</p>
                  <p className="text-xs text-sky-600">Ветер {weather.windSpeed} м/с</p>
                </div>
              </div>
            )}

            {/* Highlights */}
            <div>
              <SectionTitle>Что увидите</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {route.highlights.map((h, i) => (
                  <div key={i} className="bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 border border-gray-100 shadow-sm">
                    ⭐ {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="text-sm font-semibold text-emerald-800 mb-1">💰 Примерная стоимость</p>
              <p className="text-3xl font-bold text-emerald-700">~{route.baseCost.toLocaleString('ru')} ₽</p>
              <p className="text-xs text-emerald-600 mt-1">Транспорт, еда и билеты</p>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 pb-2">
              {route.kidFriendly && <Tag>👨‍👧 Подходит с детьми</Tag>}
              {route.dogFriendly && <Tag>🐕 Подходит с собакой</Tag>}
              {route.hasRailStation && <Tag>🚂 Есть электричка ({route.railStationName})</Tag>}
              {route.hasParking && <Tag>🅿️ Есть парковка</Tag>}
            </div>
          </>
        )}

        {/* МЕСТА */}
        {tab === 'места' && (
          <div>
            <SectionTitle>Сценарий дня</SectionTitle>
            <div className="space-y-0">
              {route.dayScenario.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1" />
                    {i < route.dayScenario.length - 1 && (
                      <div className="w-0.5 bg-emerald-100 flex-1 my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <span className="text-xs font-bold text-emerald-600 tracking-wide">{step.time}</span>
                    <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{step.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* БИЛЕТЫ */}
        {tab === 'билеты' && (
          <>
            {/* Transport */}
            <div>
              <SectionTitle>Как добраться</SectionTitle>
              <div className="space-y-3">
                {transportInfo.train && (
                  <TransportCard
                    icon="🚂"
                    title="Электричка"
                    info={transportInfo.train}
                    color="violet"
                  />
                )}
                {transportInfo.bus && (
                  <TransportCard
                    icon="🚌"
                    title="Автобус"
                    info={transportInfo.bus}
                    color="sky"
                  />
                )}
                {transportInfo.ferry && (
                  <TransportCard
                    icon="⛴️"
                    title="Паром"
                    info={transportInfo.ferry}
                    color="blue"
                  />
                )}
                {!transportInfo.train && !transportInfo.bus && !transportInfo.ferry && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm text-gray-500">
                    🚗 Доступен только на автомобиле
                  </div>
                )}
              </div>
            </div>

            {/* Entrance tickets */}
            {tickets.length > 0 && (
              <div>
                <SectionTitle>Входные билеты и экскурсии</SectionTitle>
                <div className="space-y-3">
                  {tickets.map((t, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{TICKET_ICON[t.type] || '🎫'}</span>
                            <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                          </div>
                          {t.schedule && (
                            <p className="text-xs text-gray-500">🕐 {t.schedule}</p>
                          )}
                          {t.departure && (
                            <p className="text-xs text-gray-500 mt-0.5">📍 {t.departure}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-emerald-700 text-base">
                            {t.cost === 0 ? 'Бесплатно' : `${t.cost.toLocaleString('ru')} ₽`}
                          </p>
                          {t.buyUrl && (
                            <a
                              href={t.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-600 font-medium mt-1 block hover:underline"
                            >
                              Купить →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ЕДА */}
        {tab === 'еда' && (
          <div>
            <SectionTitle>Где поесть</SectionTitle>
            {cafes.length > 0 ? (
              <div className="space-y-3">
                {cafes.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{c.type}</span>
                    </div>
                    <p className="text-xs text-gray-500">{c.cuisine}</p>
                    {c.note && <p className="text-xs text-gray-400 mt-0.5">📍 {c.note}</p>}
                    <p className="text-sm font-semibold text-emerald-700 mt-2">{c.priceRange}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-sm text-amber-800">
                🧺 Рекомендуем взять еду с собой — кафе рядом нет
              </div>
            )}
          </div>
        )}

        {/* КАРТА */}
        {tab === 'карта' && (
          <div>
            <SectionTitle>Карта</SectionTitle>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 420 }}>
              <Suspense fallback={<div className="h-full w-full bg-gray-200 animate-pulse" />}>
                <MapView
                  lat={route.lat}
                  lng={route.lng}
                  name={route.name}
                  hasParking={route.hasParking}
                  hasRailStation={route.hasRailStation}
                  railStationName={route.railStationName}
                />
              </Suspense>
            </div>
            {route.hasParking && (
              <p className="text-xs text-gray-500 mt-3 flex gap-1.5">
                <span>🅿️</span>
                <span>{route.parkingNote}</span>
              </p>
            )}
          </div>
        )}

        {/* ВОЗВРАТ */}
        {tab === 'возврат' && (
          <>
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
              <p className="text-sm font-semibold text-sky-900 mb-1">🚌 Как вернуться</p>
              <p className="text-sm text-sky-700 leading-relaxed">{route.returnNote}</p>
            </div>

            {(transportInfo.train || transportInfo.bus) && (
              <div>
                <SectionTitle>Обратный транспорт</SectionTitle>
                <div className="space-y-3">
                  {transportInfo.train && (
                    <TransportCard
                      icon="🚂"
                      title="Электричка обратно"
                      info={{ ...transportInfo.train, from: transportInfo.train.to, to: 'СПб' }}
                      color="violet"
                    />
                  )}
                  {transportInfo.bus && (
                    <TransportCard
                      icon="🚌"
                      title="Автобус обратно"
                      info={{ ...transportInfo.bus, from: transportInfo.bus.to, to: 'СПб' }}
                      color="sky"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ОТЗЫВЫ */}
        {tab === 'отзывы' && (
          <Reviews routeId={route.id} />
        )}

        {/* ПОЛЕЗНОЕ */}
        {tab === 'полезное' && (
          <>
            {route.warnings?.length > 0 && (
              <div>
                <SectionTitle>Важно знать</SectionTitle>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                  <ul className="space-y-2">
                    {route.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-red-700 flex gap-2">
                        <span className="flex-shrink-0">⚠️</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <SectionTitle>Особенности маршрута</SectionTitle>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
                <InfoRow icon="🗺" label="Расстояние" value={`${route.distanceKm} км от СПб`} />
                <InfoRow icon="🚗" label="Время в пути" value={`${route.driveTimeMin} мин на авто`} />
                <InfoRow icon="⏱" label="Длительность" value={`~${route.durationHours} часов`} />
                <InfoRow icon="📊" label="Сложность" value={route.difficulty} />
                <InfoRow icon="👧" label="С детьми" value={route.kidFriendly ? 'Подходит' : 'Не рекомендуется'} />
                <InfoRow icon="🐕" label="С собакой" value={route.dogFriendly ? 'Разрешено' : 'Не разрешено'} />
                <InfoRow icon="🅿️" label="Парковка" value={route.hasParking ? 'Есть' : 'Нет'} />
                <InfoRow icon="🚂" label="Электричка" value={route.hasRailStation ? `Ст. ${route.railStationName}` : 'Нет'} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-bold text-gray-900 mb-3">{children}</h2>;
}

function Tag({ children }) {
  return (
    <span className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full">
      {children}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{icon} {label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

const TRANSPORT_COLORS = {
  violet: 'bg-violet-50 border-violet-100',
  sky: 'bg-sky-50 border-sky-100',
  blue: 'bg-blue-50 border-blue-100',
};

function TransportCard({ icon, title, info, color }) {
  const cls = TRANSPORT_COLORS[color] || 'bg-gray-50 border-gray-100';
  return (
    <div className={`rounded-2xl p-4 border ${cls}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-gray-900">{icon} {title}</span>
        <span className="text-sm font-bold text-emerald-700">от {info.costFrom.toLocaleString('ru')} ₽</span>
      </div>
      <p className="text-xs text-gray-600">📍 {info.from} → {info.to}</p>
      <p className="text-xs text-gray-600 mt-0.5">⏱ {info.duration}</p>
      <p className="text-xs text-gray-600 mt-0.5">🕐 {info.schedule}</p>
      {info.buyUrl && (
        <a
          href={info.buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-semibold text-violet-600 hover:underline"
        >
          Расписание и билеты →
        </a>
      )}
    </div>
  );
}
