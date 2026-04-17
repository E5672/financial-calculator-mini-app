import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const parkingIcon = L.divIcon({
  className: '',
  html: '<div style="background:#3b82f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">🅿</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const stationIcon = L.divIcon({
  className: '',
  html: '<div style="background:#8b5cf6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">🚂</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function MapView({ lat, lng, name, hasParking, hasRailStation, railStationName }) {
  const yandexUrl = `https://yandex.ru/maps/?pt=${lng},${lat}&z=14&l=map`;
  const googleUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const twoGisUrl = `https://2gis.ru/geo/${lat},${lng}`;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup><strong>{name}</strong></Popup>
        </Marker>
        {hasParking && (
          <Marker position={[lat - 0.003, lng + 0.004]} icon={parkingIcon}>
            <Popup>🅿️ Парковка</Popup>
          </Marker>
        )}
        {hasRailStation && (
          <Marker position={[lat + 0.004, lng - 0.003]} icon={stationIcon}>
            <Popup>🚂 Ст. {railStationName}</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Navigator button */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <a
          href={yandexUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-md text-xs font-semibold text-gray-800 hover:bg-gray-50 border border-gray-100 active:scale-95 transition-all"
        >
          🧭 Яндекс Карты
        </a>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-md text-xs font-semibold text-gray-800 hover:bg-gray-50 border border-gray-100 active:scale-95 transition-all"
        >
          🗺️ Google Maps
        </a>
        <a
          href={twoGisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-md text-xs font-semibold text-gray-800 hover:bg-gray-50 border border-gray-100 active:scale-95 transition-all"
        >
          📍 2ГИС
        </a>
      </div>
    </div>
  );
}
