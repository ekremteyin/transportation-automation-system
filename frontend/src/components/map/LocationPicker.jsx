import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const makeIcon = (color, label) => L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;line-height:1">${label}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

const ORIGIN_ICON = makeIcon('#2563eb', 'A');
const DEST_ICON   = makeIcon('#dc2626', 'B');

function FitBounds({ origin, dest }) {
  const map = useMap();
  useEffect(() => {
    if (origin && dest) {
      map.fitBounds([[origin.lat, origin.lng], [dest.lat, dest.lng]], { padding: [48, 48] });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 10);
    } else if (dest) {
      map.setView([dest.lat, dest.lng], 10);
    }
  }, [origin, dest, map]);
  return null;
}

async function geocode(city, district) {
  try {
    const q = district ? `${district},${city},Turkey` : `${city},Turkey`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tr`,
      { headers: { 'Accept-Language': 'tr', 'User-Agent': 'NakliyeApp/1.0' } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export default function LocationPicker({
  // Kayıtlı koordinatlar (AdvertDetail için)
  originLat, originLng, destLat, destLng,
  // Şehir isimleri (geocode fallback için)
  originCity, originDistrict,
  destCity, destDistrict,
  // Popup etiketleri
  originLabel, destLabel,
  height = '280px',
}) {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest]     = useState(null);

  useEffect(() => {
    if (originLat && originLng) { setOrigin({ lat: originLat, lng: originLng }); return; }
    if (!originCity) { setOrigin(null); return; }
    geocode(originCity, originDistrict).then(r => setOrigin(r));
  }, [originLat, originLng, originCity, originDistrict]);

  useEffect(() => {
    if (destLat && destLng) { setDest({ lat: destLat, lng: destLng }); return; }
    if (!destCity) { setDest(null); return; }
    geocode(destCity, destDistrict).then(r => setDest(r));
  }, [destLat, destLng, destCity, destDistrict]);

  if (!origin && !dest) return null;

  const center = origin
    ? [origin.lat, origin.lng]
    : [dest.lat, dest.lng];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height, width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> katkıcıları'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={ORIGIN_ICON}>
          <Popup>{originLabel || originCity || 'Kalkış'}</Popup>
        </Marker>
      )}
      {dest && (
        <Marker position={[dest.lat, dest.lng]} icon={DEST_ICON}>
          <Popup>{destLabel || destCity || 'Varış'}</Popup>
        </Marker>
      )}
      <FitBounds origin={origin} dest={dest} />
    </MapContainer>
  );
}
