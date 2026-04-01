import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchSuggestionsClient, geocodeClient } from '../services/ymapsGeocode';
import './AddressInput.css';

export function AddressInput({ label, placeholder, value, onChange, required, onPickFromMap, isPickingFromMap }) {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Синхронизировать если точка выбрана снаружи (с карты)
  useEffect(() => {
    if (value?.address && value.address !== query) {
      setQuery(value.address);
    }
  }, [value?.address]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    if (value?.lat) onChange(null);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchSuggestionsClient(val);
        setSuggestions(data);
        setOpen(data.length > 0);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [value, onChange]);

  const handleSelect = useCallback(async (s) => {
    const address = s.value;
    setQuery(address);
    setOpen(false);
    setSuggestions([]);

    // Если geocode вернул координаты сразу (из fallback)
    if (s._fromGeocode && s.lat) {
      onChange({ address, lat: s.lat, lng: s.lng });
      return;
    }

    setLoading(true);
    try {
      const coords = await geocodeClient(address, s._suggestValue);
      onChange({ address, lat: coords.lat, lng: coords.lng });
    } catch {
      onChange({ address, lat: null, lng: null });
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const isSelected = !!(value?.lat);

  return (
    <div
      className={`addr-input ${isSelected ? 'addr-input--selected' : ''} ${isPickingFromMap ? 'addr-input--picking' : ''}`}
      ref={containerRef}
    >
      <label className="addr-input__label">
        {label}
        {required && <span className="addr-input__required">*</span>}
      </label>
      <div className="addr-input__wrapper">
        <input
          type="text"
          className="addr-input__field"
          placeholder={isPickingFromMap ? 'Кликните на карте...' : (placeholder || 'Начните вводить адрес...')}
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
          readOnly={isPickingFromMap}
        />
        <div className="addr-input__actions">
          {loading && <span className="addr-input__spinner" />}
          {isSelected && !loading && <span className="addr-input__check">✓</span>}
          {onPickFromMap && (
            <button
              type="button"
              className={`addr-input__map-btn ${isPickingFromMap ? 'addr-input__map-btn--active' : ''}`}
              title="Указать на карте"
              onClick={onPickFromMap}
            >
              📍
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="addr-input__dropdown">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className="addr-input__suggestion"
              onMouseDown={() => handleSelect(s)}
            >
              <span className="addr-input__sug-name">{s.name}</span>
              {s.description && <span className="addr-input__sug-desc">{s.description}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
