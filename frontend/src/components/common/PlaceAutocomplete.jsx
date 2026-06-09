import { useEffect, useRef, useState } from 'react';
import citiesData from '../../data/turkey-cities.json';

const provinces = Object.keys(citiesData).sort();

async function fetchCoords(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=tr&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NakliyeApp/1.0' } });
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// mode="city"     — JSON'dan il filtreler, seçince Nominatim'den koordinat alır
// mode="district" — JSON'dan o ilin ilçelerini gösterir, seçince Nominatim'den koordinat alır
// onSelect(name, coords) — coords: { lat, lng } veya null
export default function PlaceAutocomplete({
  value, onChange, onSelect,
  placeholder, disabled = false, required = false,
  mode = 'city',
  city = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const wrapperRef = useRef(null);

  // Şehir değişince ilçe önbelleklerini sıfırla
  useEffect(() => {
    if (mode === 'district') {
      setSuggestions([]);
      setOpen(false);
    }
  }, [city, mode]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDistricts = () => citiesData[city] || [];

  const handleFocus = () => {
    if (mode === 'district' && city) {
      const districts = getDistricts();
      const filtered = value
        ? districts.filter(d => d.toLowerCase().includes(value.toLowerCase()))
        : districts;
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else if (mode === 'city' && suggestions.length > 0) {
      setOpen(true);
    }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);

    if (mode === 'city') {
      if (!v) { setSuggestions([]); setOpen(false); return; }
      const filtered = provinces.filter(p =>
        p.toLocaleLowerCase('tr').includes(v.toLocaleLowerCase('tr'))
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else if (mode === 'district' && city) {
      const districts = getDistricts();
      const filtered = v
        ? districts.filter(d => d.toLocaleLowerCase('tr').includes(v.toLocaleLowerCase('tr')))
        : districts;
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    }
  };

  const handleSelect = async (name) => {
    onChange(name);
    setSuggestions([]);
    setOpen(false);

    const query = mode === 'district' && city
      ? `${name}, ${city}, Turkey`
      : `${name}, Turkey`;
    const coords = await fetchCoords(query);
    onSelect(name, coords);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''
        }`}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto text-sm">
          {suggestions.map((name, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(name)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-slate-700"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
