import { useEffect, useRef, useState } from 'react';
import { waitForYmaps } from '../services/ymapsGeocode';

const SEG_COLORS = ['#4f80ff', '#f59e0b'];
const MARKER_COLORS = ['#22c55e', '#4f80ff', '#f59e0b'];
const MARKER_LABELS = ['А', 'Б', 'В'];

export function useYandexMap(containerId, { onMapClick } = {}) {
  const mapRef = useRef(null);
  const objectsRef = useRef([]);
  const onMapClickRef = useRef(onMapClick);
  const [isReady, setIsReady] = useState(false);

  // Всегда актуальный колбэк без ре-подписки
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  useEffect(() => {
    let destroyed = false;

    waitForYmaps().then((ymaps) => {
      if (destroyed) return;

      const map = new ymaps.Map(containerId, {
        center: [55.75, 37.62],
        zoom: 5,
        controls: ['zoomControl', 'fullscreenControl'],
      });

      // Клик по карте — передаём координаты наружу
      map.events.add('click', (e) => {
        const [lat, lng] = e.get('coords');
        if (onMapClickRef.current) onMapClickRef.current({ lat, lng });
      });

      mapRef.current = map;
      setIsReady(true);
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        try { mapRef.current.destroy(); } catch (_) {}
        mapRef.current = null;
      }
    };
  }, [containerId]);

  /** Нарисовать маршрут по массиву точек [{lat, lng, address}] */
  async function drawRoute(waypoints) {
    if (!mapRef.current || waypoints.length < 2) return;
    const ymaps = await waitForYmaps();
    const map = mapRef.current;

    clearObjects();

    const allCoords = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const color = SEG_COLORS[i % SEG_COLORS.length];

      try {
        // ymaps.route() — работает без multiRouter
        const route = await ymaps.route(
          [[from.lat, from.lng], [to.lat, to.lng]],
          { routingMode: 'auto' }
        );

        // Стилизуем линию маршрута
        route.getPaths().each(path => {
          path.options.set({
            strokeColor: color,
            strokeWidth: 5,
            opacity: 0.85,
          });
          // Убираем стандартные маркеры пути
          path.getSegments().each(seg => {
            seg.options.set({ strokeColor: color, strokeWidth: 5 });
          });
        });

        // Скрываем стандартные waypoint-маркеры ymaps
        route.getWayPoints().each(wp => wp.options.set({ visible: false }));

        map.geoObjects.add(route);
        objectsRef.current.push(route);
        allCoords.push([from.lat, from.lng], [to.lat, to.lng]);
      } catch (err) {
        console.warn(`Плечо ${i + 1} не построено:`, err);
        // Fallback: рисуем прямую линию
        const line = new ymaps.Polyline(
          [[from.lat, from.lng], [to.lat, to.lng]],
          {},
          { strokeColor: color, strokeWidth: 4, opacity: 0.7, strokeStyle: 'dash' }
        );
        map.geoObjects.add(line);
        objectsRef.current.push(line);
        allCoords.push([from.lat, from.lng], [to.lat, to.lng]);
      }
    }

    // Маркеры точек
    waypoints.forEach((wp, idx) => {
      const placemark = new ymaps.Placemark(
        [wp.lat, wp.lng],
        {
          balloonContent: `<b>${MARKER_LABELS[idx]}</b><br>${wp.address || ''}`,
          iconContent: MARKER_LABELS[idx],
        },
        {
          preset: 'islands#circleIcon',
          iconColor: MARKER_COLORS[idx],
        }
      );
      map.geoObjects.add(placemark);
      objectsRef.current.push(placemark);
    });

    // Подогнать карту
    if (allCoords.length >= 2) {
      try {
        map.setBounds(ymaps.util.bounds.fromPoints(allCoords), {
          checkZoomRange: true,
          zoomMargin: 80,
        });
      } catch (_) {}
    }
  }

  /** Поставить временный маркер при выборе точки кликом */
  function setTempMarker(lat, lng, label = '?') {
    if (!mapRef.current) return;
    waitForYmaps().then(ymaps => {
      // Удалить старый временный маркер
      objectsRef.current
        .filter(o => o._isTempMarker)
        .forEach(o => { mapRef.current.geoObjects.remove(o); });
      objectsRef.current = objectsRef.current.filter(o => !o._isTempMarker);

      const pm = new ymaps.Placemark(
        [lat, lng],
        { iconContent: label },
        { preset: 'islands#circleIcon', iconColor: '#a78bfa' }
      );
      pm._isTempMarker = true;
      mapRef.current.geoObjects.add(pm);
      objectsRef.current.push(pm);
    });
  }

  function clearObjects() {
    if (!mapRef.current) return;
    objectsRef.current.forEach(o => {
      try { mapRef.current.geoObjects.remove(o); } catch (_) {}
    });
    objectsRef.current = [];
  }

  function setCursor(type) {
    if (mapRef.current) mapRef.current.container.getElement().style.cursor = type;
  }

  return { isReady, drawRoute, clearObjects, setTempMarker, setCursor };
}
