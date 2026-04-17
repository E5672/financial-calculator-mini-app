import { useLocation, useNavigate } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import PhotoGallery from '../components/PhotoGallery';
import Reviews from '../components/Reviews';

const MapView = lazy(() => import('../components/MapView'));

// ─────────────────────────── константы ────────────────────────────

const DIFFICULTY = {
  легко: 'text-emerald-700 bg-emerald-50',
  средне: 'text-amber-700 bg-amber-50',
  сложно: 'text-red-700 bg-red-50',
};

const TYPE_ICON = {
  лес: '🌲', вода: '💧', болота: '🌿', скалы: '⛰️', панорамы: '🔭', исторические: '🏰',
};

const TYPE_BG = {
  лес: 'from-emerald-900 to-green-800',
  вода: 'from-blue-900 to-cyan-800',
  болота: 'from-green-900 to-emerald-800',
  скалы: 'from-stone-800 to-slate-700',
  панорамы: 'from-sky-900 to-blue-800',
  исторические: 'from-amber-900 to-stone-800',
};

const TICKET_ICON = { museum: '🏛️', park: '🌳', excursion: '🎫' };

const TABS = [
  { id: 'обзор',    label: 'Обзор' },
  { id: 'маршрут', label: 'Маршрут' },
  { id: 'места',   label: 'Места' },
  { id: 'билеты',  label: 'Билеты' },
  { id: 'еда',     label: 'Еда' },
  { id: 'карта',   label: 'Карта' },
  { id: 'отзывы',  label: 'Отзывы' },
  { id: 'полезное',label: 'Полезное' },
];

// ─────────────────────────── главный компонент ─────────────────────

export default function Details() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('обзор');
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandedPoi, setExpandedPoi] = useState(null);

  if (!state?.route) { navigate('/'); return null; }

  const { route, weather } = state;

  // Fallback: gallery → photos → []
  const gallery = route.gallery || route.photos || [];
  // Hero gradient fallback color based on first type
  const heroGradient = TYPE_BG[route.types?.[0]] || 'from-emerald-900 to-emerald-700';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══ HERO ══ */}
      <div className="relative h-64 md:h-72 overflow-hidden">
        {route.heroImage ? (
          <img
            src={route.heroImage}
            alt={route.name}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        {/* Fallback gradient (visible when no heroImage or image fails) */}
        <div
          className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center ${route.heroImage ? 'hidden' : 'flex'}`}
          style={{ display: route.heroImage ? 'none' : 'flex' }}
        >
          <span className="text-8xl opacity-20">{TYPE_ICON[route.types?.[0]] || '🗺️'}</span>
        </div>
        {/* Dark overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl shadow-md text-gray-700 text-lg font-bold"
        >
          ←
        </button>
      </div>

      {/* ══ ЗАГОЛОВОК + СТАТИСТИКА ══ */}
      <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 leading-snug">{route.name}</h1>
        {route.subtitle && (
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{route.subtitle}</p>
        )}

        {/* Types */}
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {route.types?.map(t => (
            <span key={t} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
              {TYPE_ICON[t]} {t}
            </span>
          ))}
          {route.mood && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
              {route.mood}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-3 text-sm text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">🗺 <span>{route.distanceKm} км</span></span>
          <span className="flex items-center gap-1">⏱ <span>~{route.durationHours} ч</span></span>
          <span className="flex items-center gap-1">💰 <span>~{route.baseCost?.toLocaleString('ru')} ₽</span></span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY[route.difficulty] || 'bg-gray-100 text-gray-600'}`}>
            {route.difficulty}
          </span>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      {/* ══ TAB CONTENT ══ */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-7">

        {/* ─── ОБЗОР ─── */}
        {tab === 'обзор' && (
          <>
            {/* Gallery */}
            {gallery.length > 0 && (
              <section>
                <SectionTitle>Галерея маршрута</SectionTitle>
                <PhotoGallery routeId={route.id} gallery={gallery} />
              </section>
            )}

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm">{route.description}</p>

            {/* Why Go */}
            {route.whyGo?.length > 0 && (
              <section>
                <SectionTitle>Почему стоит поехать</SectionTitle>
                <div className="space-y-2.5">
                  {route.whyGo.map((item, i) => (
                    <div key={i} className="flex gap-3 bg-emerald-50/60 rounded-xl px-4 py-3 border border-emerald-100">
                      <span className="text-emerald-500 flex-shrink-0 mt-0.5">✦</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formats */}
            {route.formats?.length > 0 && (
              <section>
                <SectionTitle>Форматы дня</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {route.formats.map(f => (
                    <div key={f.id} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
                      <p className="font-semibold text-sm text-gray-900 leading-tight">{f.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Best seasons */}
            {route.bestSeasons?.length > 0 && (
              <section>
                <SectionTitle>Лучший сезон</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {route.bestSeasons.map(s => (
                    <span key={s} className="text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1.5 rounded-full capitalize">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Weather */}
            {weather && (
              <div className="bg-sky-50 rounded-2xl p-4 flex items-center gap-3 border border-sky-100">
                <span className="text-4xl">{weather.icon}</span>
                <div>
                  <p className="font-semibold text-sky-900 capitalize">{weather.description}, {weather.temp}°C</p>
                  <p className="text-xs text-sky-600 mt-0.5">Ветер {weather.windSpeed} м/с</p>
                </div>
              </div>
            )}

            {/* Cost */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <p className="text-sm font-semibold text-emerald-800 mb-1">💰 Примерная стоимость</p>
              <p className="text-3xl font-bold text-emerald-700">~{route.baseCost?.toLocaleString('ru')} ₽</p>
              <p className="text-xs text-emerald-600 mt-1">Транспорт, еда и билеты</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pb-1">
              {route.kidFriendly && <Tag>👨‍👧 Подходит с детьми</Tag>}
              {route.dogFriendly && <Tag>🐕 Подходит с собакой</Tag>}
              {route.hasRailStation && <Tag>🚂 Есть электричка ({route.railStationName})</Tag>}
              {route.hasParking && <Tag>🅿️ Есть парковка</Tag>}
            </div>
          </>
        )}

        {/* ─── МАРШРУТ ─── */}
        {tab === 'маршрут' && (
          <>
            {/* Transport scenarios (new) */}
            {route.transportScenarios?.length > 0 ? (
              <section>
                <SectionTitle>Как добраться</SectionTitle>
                {/* Scenario switcher */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {route.transportScenarios.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveScenario(i)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                        activeScenario === i
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                      }`}
                    >
                      {s.title}
                      {s.recommended && activeScenario !== i && (
                        <span className="text-emerald-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Active scenario card */}
                {(() => {
                  const s = route.transportScenarios[activeScenario];
                  return (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">{s.summary}</p>
                          {s.recommended && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                              ✓ рекомендуем
                            </span>
                          )}
                        </div>
                        {s.estimatedCost && (
                          <p className="text-sm font-semibold text-emerald-700 mt-2">{s.estimatedCost}</p>
                        )}
                      </div>

                      {/* Steps timeline */}
                      {s.steps?.length > 0 && (
                        <div className="px-4 py-3">
                          {s.steps.map((step, i) => (
                            <div key={i} className="flex gap-3 mb-0">
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                                {i < s.steps.length - 1 && <div className="w-0.5 bg-emerald-100 flex-1 my-1" />}
                              </div>
                              <div className="pb-3">
                                <span className="text-xs font-bold text-emerald-600">{step.time}</span>
                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{step.title}</p>
                                {step.details && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.details}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      {s.links?.length > 0 && (
                        <div className="px-4 pb-3 flex flex-col gap-2">
                          {s.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-violet-600 bg-violet-50 px-3 py-2.5 rounded-xl hover:bg-violet-100 transition-colors"
                            >
                              <span>🔗</span>
                              <span>{link.label}</span>
                              <span className="ml-auto text-violet-400">→</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {s.notes?.length > 0 && (
                        <div className="px-4 pb-4">
                          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            {s.notes.map((note, i) => (
                              <p key={i} className="text-xs text-amber-800 flex gap-1.5 leading-relaxed mt-1 first:mt-0">
                                <span className="flex-shrink-0">•</span>
                                <span>{note}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>
            ) : (
              /* Fallback: old transportInfo cards */
              route.transportInfo && (
                <section>
                  <SectionTitle>Как добраться</SectionTitle>
                  <div className="space-y-3">
                    {route.transportInfo.train && (
                      <TransportCard icon="🚂" title="Электричка" info={route.transportInfo.train} color="violet" />
                    )}
                    {route.transportInfo.bus && (
                      <TransportCard icon="🚌" title="Автобус" info={route.transportInfo.bus} color="sky" />
                    )}
                    {route.transportInfo.ferry && (
                      <TransportCard icon="⛴️" title="Паром" info={route.transportInfo.ferry} color="blue" />
                    )}
                    {!route.transportInfo.train && !route.transportInfo.bus && !route.transportInfo.ferry && (
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm text-gray-500">
                        🚗 Доступен только на автомобиле
                      </div>
                    )}
                  </div>
                </section>
              )
            )}

            {/* Day scenario */}
            <section>
              <SectionTitle>Сценарий дня</SectionTitle>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                {route.dayScenario?.map((step, i) => (
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
            </section>
          </>
        )}

        {/* ─── МЕСТА ─── */}
        {tab === 'места' && (
          <>
            {route.poi?.length > 0 ? (
              <section>
                <SectionTitle>Что вы увидите</SectionTitle>
                <div className="space-y-3">
                  {route.poi.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* POI image */}
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-36 object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-base leading-snug">{p.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{p.short}</p>
                          </div>
                          {p.timeNeeded && (
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 border border-gray-100">
                              ⏱ {p.timeNeeded}
                            </span>
                          )}
                        </div>

                        {/* Expand toggle */}
                        <button
                          onClick={() => setExpandedPoi(expandedPoi === p.id ? null : p.id)}
                          className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {expandedPoi === p.id ? '▲ Свернуть' : '▼ Читать подробнее'}
                        </button>

                        {/* Expanded content */}
                        {expandedPoi === p.id && (
                          <div className="mt-3 space-y-3 pt-3 border-t border-gray-50">
                            <p className="text-sm text-gray-600 leading-relaxed">{p.details}</p>

                            {p.whatToLook?.length > 0 && (
                              <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">На что обратить внимание</p>
                                <ul className="space-y-1">
                                  {p.whatToLook.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                                      <span className="text-emerald-400 flex-shrink-0">—</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Second image if available */}
                            {p.images?.[1] && (
                              <img
                                src={p.images[1]}
                                alt={p.name}
                                className="w-full h-28 object-cover rounded-xl"
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                              />
                            )}

                            {p.links?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {p.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-violet-600 hover:underline flex items-center gap-1.5"
                                  >
                                    <span>🔗</span>
                                    <span>{link.label}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              /* Fallback: highlights grid */
              <section>
                <SectionTitle>Что увидите</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {route.highlights?.map((h, i) => (
                    <div key={i} className="bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 border border-gray-100 shadow-sm">
                      ⭐ {h}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ─── БИЛЕТЫ ─── */}
        {tab === 'билеты' && (
          <>
            {/* Transport info */}
            {route.transportInfo && (
              <section>
                <SectionTitle>Транспорт до места</SectionTitle>
                <div className="space-y-3">
                  {route.transportInfo.train && (
                    <TransportCard icon="🚂" title="Электричка" info={route.transportInfo.train} color="violet" />
                  )}
                  {route.transportInfo.bus && (
                    <TransportCard icon="🚌" title="Автобус" info={route.transportInfo.bus} color="sky" />
                  )}
                  {route.transportInfo.ferry && (
                    <TransportCard icon="⛴️" title="Паром" info={route.transportInfo.ferry} color="blue" />
                  )}
                  {!route.transportInfo.train && !route.transportInfo.bus && !route.transportInfo.ferry && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm text-gray-500">
                      🚗 Доступен только на автомобиле
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Entrance tickets */}
            {route.tickets?.length > 0 && (
              <section>
                <SectionTitle>Входные билеты</SectionTitle>
                <div className="space-y-3">
                  {route.tickets.map((t, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{TICKET_ICON[t.type] || '🎫'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          {t.schedule && <p className="text-xs text-gray-500 mt-1">🕐 {t.schedule}</p>}
                          {t.departure && <p className="text-xs text-gray-500 mt-0.5">📍 {t.departure}</p>}
                          {t.note && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 mt-2 border border-amber-100">{t.note}</p>}
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {t.buyUrl && (
                              <a href={t.buyUrl} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-semibold text-white bg-emerald-500 px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">
                                Купить билет →
                              </a>
                            )}
                            {t.infoUrl && (
                              <a href={t.infoUrl} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors border border-violet-100">
                                Официальная страница →
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold text-base text-emerald-700">
                            {t.cost === null || t.cost === undefined
                              ? 'уточнять'
                              : t.cost === 0 ? 'Бесплатно'
                              : `${t.cost.toLocaleString('ru')} ₽`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ─── ЕДА ─── */}
        {tab === 'еда' && (
          <>
            {route.cafes?.length > 0 && (
              <section>
                <SectionTitle>Где поесть</SectionTitle>
                <div className="space-y-3">
                  {route.cafes.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">{c.type}</span>
                      </div>
                      {c.cuisine && <p className="text-xs text-gray-500">{c.cuisine}</p>}
                      {c.note && <p className="text-xs text-gray-400 mt-0.5">📍 {c.note}</p>}
                      {c.dogFriendly === true && <p className="text-xs text-emerald-600 mt-1">🐕 Можно с собакой</p>}
                      {c.dogFriendly === 'уточнять на месте' && <p className="text-xs text-amber-600 mt-1">🐕 Собаки — уточнять на месте</p>}
                      <p className="text-sm font-semibold text-emerald-700 mt-2">{c.priceRange}</p>
                      {c.link && (
                        <a href={c.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-violet-600 mt-1.5 block hover:underline">
                          Подробнее →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Picnic block */}
            {route.picnic?.suitable && (
              <section>
                <SectionTitle>Пикник</SectionTitle>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                  <p className="text-sm text-amber-900 font-medium">{route.picnic.format}</p>
                  {route.picnic.notes?.map((n, i) => (
                    <p key={i} className="text-sm text-amber-800 flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{n}</span>
                    </p>
                  ))}
                  {route.picnic.fireAllowed && (
                    <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-100 mt-2">
                      🔥 Костёр: {route.picnic.fireAllowed}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Fishing — shown as optional activity */}
            {route.fishing?.availableNearby && (
              <section>
                <SectionTitle>Дополнительно: рыбалка</SectionTitle>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-2">
                  <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Опциональная активность</p>
                  <p className="text-sm text-sky-800">{route.fishing.type}</p>
                  {route.fishing.notes?.map((n, i) => (
                    <p key={i} className="text-sm text-sky-700 flex gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{n}</span>
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Activities nearby */}
            {route.activitiesNearby?.length > 0 && (
              <section>
                <SectionTitle>Активности рядом</SectionTitle>
                <div className="space-y-2">
                  {route.activitiesNearby.map((a, i) => (
                    <div key={i} className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{a.title}</p>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{a.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!route.cafes?.length && !route.picnic && !route.fishing && !route.activitiesNearby?.length && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-sm text-amber-800">
                🧺 Рекомендуем взять еду с собой — кафе рядом нет
              </div>
            )}
          </>
        )}

        {/* ─── КАРТА ─── */}
        {tab === 'карта' && (
          <section>
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
            {route.hasParking && route.parkingNote && (
              <p className="text-xs text-gray-500 mt-3 flex gap-1.5 leading-relaxed">
                <span>🅿️</span>
                <span>{route.parkingNote}</span>
              </p>
            )}
          </section>
        )}

        {/* ─── ОТЗЫВЫ ─── */}
        {tab === 'отзывы' && (
          <Reviews routeId={route.id} reviewHints={route.reviewHints} />
        )}

        {/* ─── ПОЛЕЗНОЕ ─── */}
        {tab === 'полезное' && (
          <>
            {/* Weather warnings */}
            {route.weatherWarnings?.length > 0 && (
              <section>
                <SectionTitle>Погода и условия</SectionTitle>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 space-y-2">
                  {route.weatherWarnings.map((w, i) => (
                    <p key={i} className="text-sm text-sky-800 flex gap-2">
                      <span className="flex-shrink-0">🌤</span>
                      <span>{w}</span>
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Warnings */}
            {route.warnings?.length > 0 && (
              <section>
                <SectionTitle>Важно знать</SectionTitle>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 space-y-2">
                  {route.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-red-700 flex gap-2">
                      <span className="flex-shrink-0">⚠️</span>
                      <span>{w}</span>
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Return note */}
            {route.returnNote && (
              <section>
                <SectionTitle>Как вернуться</SectionTitle>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <p className="text-sm text-sky-800 leading-relaxed">{route.returnNote}</p>
                </div>
              </section>
            )}

            {/* Route stats */}
            <section>
              <SectionTitle>Характеристики маршрута</SectionTitle>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                <InfoRow icon="🗺" label="Расстояние" value={`${route.distanceKm} км от СПб`} />
                <InfoRow icon="🚗" label="Время в пути" value={`${route.driveTimeMin} мин на авто`} />
                <InfoRow icon="⏱" label="Длительность" value={`~${route.durationHours} часов`} />
                <InfoRow icon="📊" label="Сложность" value={route.difficulty} />
                <InfoRow icon="👧" label="С детьми" value={route.kidFriendly ? 'Подходит' : 'Не рекомендуется'} />
                <InfoRow icon="🐕" label="С собакой" value={route.dogFriendly ? 'Разрешено' : 'Не разрешено'} />
                <InfoRow icon="🅿️" label="Парковка" value={route.hasParking ? 'Есть' : 'Нет'} />
                {route.hasRailStation && (
                  <InfoRow icon="🚂" label="Электричка" value={`Ст. ${route.railStationName}`} />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── вспомогательные компоненты ────────────────────────

function SectionTitle({ children }) {
  return <h2 className="font-bold text-gray-900 mb-3 text-base">{children}</h2>;
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
      <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
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
        {info.costFrom != null && (
          <span className="text-sm font-bold text-emerald-700">от {info.costFrom.toLocaleString('ru')} ₽</span>
        )}
      </div>
      <p className="text-xs text-gray-600">📍 {info.from} → {info.to}</p>
      <p className="text-xs text-gray-600 mt-0.5">⏱ {info.duration}</p>
      <p className="text-xs text-gray-600 mt-0.5">🕐 {info.schedule}</p>
      {info.buyUrl && (
        <a href={info.buyUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 hover:bg-violet-100 transition-colors">
          Смотреть расписание и билеты →
        </a>
      )}
    </div>
  );
}
